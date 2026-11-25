import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("mod", Path(__file__).parents[1] / "scripts/mod.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class InstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.project = self.root / "source"
        self.project.mkdir()
        (self.project / "spire420.json").write_text('{"id":"spire420"}')
        (self.project / mod.SETTINGS).write_text("default settings")
        (self.project / "README.md").write_text("instructions")
        self.dll = self.project / "spire420.dll"
        self.dll.write_bytes(b"draft 1")
        self.dest = self.root / "MacOS/mods/spire420"

    def tearDown(self):
        self.temp.cleanup()

    def install(self):
        return mod.install_files(self.dll, self.dest, self.project)

    def test_fresh_install_has_only_one_manifest(self):
        backup, digest = self.install()
        self.assertIsNone(backup)
        self.assertEqual(len(digest), 64)
        self.assertEqual([p.name for p in self.dest.glob("*.json")], ["spire420.json"])
        self.assertEqual((self.dest / "spire420.dll").read_bytes(), b"draft 1")

    def test_upgrade_preserves_settings_and_backs_up_outside_mods(self):
        self.install()
        (self.dest / mod.SETTINGS).write_text("my colors")
        self.dll.write_bytes(b"draft 2")
        backup, _ = self.install()
        self.assertEqual((self.dest / mod.SETTINGS).read_text(), "my colors")
        self.assertEqual((backup / "spire420.dll").read_bytes(), b"draft 1")
        self.assertNotIn(self.dest.parent, backup.parents)

    def test_failed_swap_restores_previous_version(self):
        self.install()
        replace = mod.os.replace

        def fail_stage(src, dst):
            if Path(src).name.startswith(".spire420-stage-"):
                raise OSError("simulated swap failure")
            return replace(src, dst)

        self.dll.write_bytes(b"draft 2")
        with patch.object(mod.os, "replace", side_effect=fail_stage):
            with self.assertRaises(OSError): self.install()
        self.assertEqual((self.dest / "spire420.dll").read_bytes(), b"draft 1")
        self.assertFalse(list(self.dest.parent.parent.glob(".spire420-stage-*")))

    def test_unrecognized_existing_folder_is_preserved(self):
        self.dest.mkdir(parents=True)
        (self.dest / "precious.txt").write_text("untouched")
        with self.assertRaises(RuntimeError): self.install()
        self.assertEqual((self.dest / "precious.txt").read_text(), "untouched")

    def test_post_install_hash_failure_restores_previous_version(self):
        self.install()
        self.dll.write_bytes(b"draft 2")
        original_read = Path.read_bytes

        def corrupt_installed(path):
            if path == self.dest / "spire420.dll": return b"corrupt"
            return original_read(path)

        with patch.object(Path, "read_bytes", corrupt_installed):
            with self.assertRaises(RuntimeError): self.install()
        self.assertEqual((self.dest / "spire420.dll").read_bytes(), b"draft 1")

    def test_post_install_hash_failure_removes_failed_fresh_install(self):
        original_read = Path.read_bytes

        def corrupt_installed(path):
            if path == self.dest / "spire420.dll": return b"corrupt"
            return original_read(path)

        with patch.object(Path, "read_bytes", corrupt_installed):
            with self.assertRaises(RuntimeError): self.install()
        self.assertFalse(self.dest.exists())


if __name__ == "__main__": unittest.main()
