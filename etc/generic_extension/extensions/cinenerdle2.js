function initPractice() {
    const practiceModeEl = [...document.querySelectorAll("div")].find((el) =>
        el.className === "mb-[3px] leading-none text-lightGrayText" &&
        el.textContent.trim() === "PRACTICE MODE"
    );

    if (!practiceModeEl) {
        return false
    }

    alert("practice")
    return true
}

function main() {
    initPractice()
}

main()