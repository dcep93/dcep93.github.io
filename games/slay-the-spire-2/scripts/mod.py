#!/usr/bin/env python3
"""Build/check/install DcepSpire. Deliberately contains no game process control."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import struct
import subprocess
import tempfile
from datetime import datetime, timezone

PROJECT = Path(__file__).resolve().parents[1]
MOD_ID = "DcepSpire"
SETTINGS = "settings.json.txt"


def game_paths(game):
    app = game / "SlayTheSpire2.app/Contents"
    arch = "arm64" if platform.machine() == "arm64" else "x86_64"
    return app / f"Resources/data_sts2_macos_{arch}", app / "MacOS/mods" / MOD_ID


def sdk_path(override):
    candidates = [override, shutil.which("dotnet"), str(Path.home() / ".local/share/sts2-dev/dotnet/dotnet")]
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return candidate
    raise RuntimeError(".NET 9 SDK required. See README; or pass --dotnet /path/to/dotnet.")


def dotnet(sdk, *args):
    env = dict(os.environ, DOTNET_CLI_TELEMETRY_OPTOUT="1", DOTNET_SKIP_FIRST_TIME_EXPERIENCE="1")
    subprocess.run([sdk, *map(str, args)], cwd=PROJECT, env=env, check=True)


def read_pck_texts(path, wanted):
    """Read only selected text entries, using Godot 4's documented source format; no extraction."""
    with path.open("rb") as f:
        magic, version, major, minor, patch, flags = struct.unpack("<6I", f.read(24))
        if magic != 0x43504447 or version not in (2, 3) or flags & 1:
            raise RuntimeError("Unsupported/encrypted PCK header; cannot verify scene contract.")
        base, = struct.unpack("<Q", f.read(8))
        if version == 3:
            directory, = struct.unpack("<Q", f.read(8))
            f.seek(directory)
        else:
            f.read(64)
        count, = struct.unpack("<I", f.read(4))
        entries = {}
        for _ in range(count):
            length, = struct.unpack("<I", f.read(4))
            name = f.read(length).rstrip(b"\0").decode()
            offset, size = struct.unpack("<QQ", f.read(16))
            f.read(16)
            file_flags, = struct.unpack("<I", f.read(4))
            name = name.removeprefix("res://")
            if name in wanted:
                if file_flags or size > 1_000_000:
                    raise RuntimeError(f"Unsupported scene entry: {name}")
                entries[name] = (base + offset, size)
        result = {}
        for name, (offset, size) in entries.items():
            f.seek(offset)
            result[name] = f.read(size).decode()
        return result


def check_scenes(game):
    contracts = {
        "scenes/ui/normal_map_point.tscn": [
            '[node name="Icon" type="TextureRect" parent="IconContainer"]',
            '[node name="Outline" type="TextureRect" parent="IconContainer/Icon"]',
            "shader_parameter/initial_color = Color(0.705882, 0.615686, 0.537255, 1)",
        ],
        "scenes/ui/normal_map_point.gdshader": ["uniform vec3 map_color", "uniform vec3 initial_color"],
        "shaders/boss_map_point.gdshader": ["uniform vec3 map_color", "uniform vec3 black_layer_color"],
        "scenes/ui/boss_map_point.tscn": ['[node name="SpineSprite"', '[node name="PlaceholderImage"'],
        "scenes/ui/ancient_map_point.tscn": ['[node name="Icon" type="TextureRect" parent="."]'],
        "scenes/screens/map/map_screen.tscn": ['parent="MapLegend/LegendItems/EnemyLegendItem"'],
    }
    resources = game / "SlayTheSpire2.app/Contents/Resources"
    scenes = read_pck_texts(resources / "Slay the Spire 2.pck", contracts)
    for name, tokens in contracts.items():
        for token in tokens:
            if token not in scenes.get(name, ""):
                raise RuntimeError(f"Scene contract changed: {name}: {token}")
    release = json.loads((resources / "release_info.json").read_text())
    print(f"PASS {len(contracts)} scene/shader contracts on {release['version']} ({release['commit']})", flush=True)


def install_files(dll, destination, project=PROJECT):
    """Stage then atomically rename only this mod. Backups live OUTSIDE the loader's mods tree."""
    if destination.name != MOD_ID or destination.is_symlink():
        raise RuntimeError("Destination must be a real DcepSpire directory.")
    manifest = project / f"{MOD_ID}.json"
    if json.loads(manifest.read_text())["id"] != MOD_ID or not dll.is_file():
        raise RuntimeError("Build/manifest missing or mismatched.")
    expected = hashlib.sha256(dll.read_bytes()).hexdigest()
    if destination.exists():
        existing = destination / f"{MOD_ID}.json"
        if not existing.is_file() or json.loads(existing.read_text()).get("id") != MOD_ID:
            raise RuntimeError("Refusing to replace an unrecognized existing directory.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    # Sibling of mods, so even a simultaneous later launch cannot discover staging/backup manifests.
    stage_parent = destination.parent.parent
    stage = Path(tempfile.mkdtemp(prefix=".dcepspire-stage-", dir=stage_parent))
    backup = None
    try:
        for source in [dll, manifest, project / SETTINGS, project / "README.md"]:
            shutil.copy2(source, stage / source.name)
        if (destination / SETTINGS).exists():
            shutil.copy2(destination / SETTINGS, stage / SETTINGS)
        if hashlib.sha256((stage / dll.name).read_bytes()).hexdigest() != expected:
            raise RuntimeError("Staged DLL hash does not match build; existing installation untouched.")
        if destination.exists():
            stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
            backup = stage_parent / "mod-backups" / MOD_ID / stamp
            backup.parent.mkdir(parents=True, exist_ok=True)
            os.replace(destination, backup)
        try:
            os.replace(stage, destination)
            try:
                actual = hashlib.sha256((destination / dll.name).read_bytes()).hexdigest()
                if actual != expected:
                    raise RuntimeError("Installed DLL hash does not match build.")
            except BaseException:
                os.replace(destination, stage)  # Quarantine the failed copy outside the loader tree.
                raise
        except BaseException:
            if backup is not None:
                os.replace(backup, destination)
            raise
    finally:
        if stage.exists():
            shutil.rmtree(stage)
    return backup, actual


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["build", "check", "install"])
    parser.add_argument("--game-dir", type=Path, default=Path.home() / "Library/Application Support/Steam/steamapps/common/Slay the Spire 2")
    parser.add_argument("--dotnet")
    args = parser.parse_args()
    data, destination = game_paths(args.game_dir.resolve())
    sdk = sdk_path(args.dotnet)
    properties = f"-p:GameDataDir={data}"
    dotnet(sdk, "build", "DcepSpire.csproj", "-c", "Release", properties)
    if args.command in ("check", "install"):
        check_scenes(args.game_dir)
        dotnet(sdk, "run", "--project", "tests/Checks.csproj", "-c", "Release", properties, "--", data, PROJECT)
        subprocess.run([os.sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py", "-v"], cwd=PROJECT, check=True)
    if args.command == "install":
        backup, digest = install_files(PROJECT / "bin/Release/net9.0/DcepSpire.dll", destination)
        print(f"Installed: {destination}\nSHA-256: {digest}")
        if backup: print(f"Previous version: {backup}")
        print("Game process untouched. Load on a later user-controlled restart with mods enabled.")


if __name__ == "__main__":
    main()
