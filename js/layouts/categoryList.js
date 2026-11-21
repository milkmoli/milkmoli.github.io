let didInit = false;

const toggleStyle = (element, style, firstValue, secondValue) => {
  // 内联样式为空时按 firstValue 处理，否则第一次点击没有效果（要点两次）
  const currentValue = element.style[style] || firstValue;
  element.style[style] = currentValue === firstValue ? secondValue : firstValue;
};

const getParentElements = () =>
  Array.from(document.querySelectorAll(".all-category-list-item")).filter(
    (item) => item.parentElement?.classList.contains("all-category-list"),
  );

const resetChildStyles = () => {
  const parentElements = getParentElements();
  parentElements.forEach((parentElement) => {
    const childElements = parentElement.querySelectorAll(
      ".all-category-list-child",
    );
    childElements.forEach((childElement) => {
      childElement.style.maxHeight = "0px";
      childElement.style.marginTop = "0px";
    });
  });
};

const handleCategoryClick = (event) => {
  const parentElement = event.target.closest(".all-category-list-item");
  if (!parentElement) {
    return;
  }

  if (!parentElement.parentElement?.classList.contains("all-category-list")) {
    return;
  }

  const childElements = parentElement.querySelectorAll(
    ".all-category-list-child",
  );

  childElements.forEach((childElement) => {
    toggleStyle(childElement, "maxHeight", "0px", "1000px");
    toggleStyle(childElement, "marginTop", "0px", "15px");
  });

  const parentElements = getParentElements();
  const clickedElementTopOffset = parentElement.offsetTop;

  parentElements.forEach((siblingElement) => {
    if (
      siblingElement.offsetTop === clickedElementTopOffset &&
      siblingElement !== parentElement
    ) {
      const siblingChildElements = siblingElement.querySelectorAll(
        ".all-category-list-child",
      );
      siblingChildElements.forEach((siblingChildElement) => {
        toggleStyle(siblingChildElement, "maxHeight", "0px", "1000px");
        toggleStyle(siblingChildElement, "marginTop", "0px", "15px");
      });
    }
  });
};

export default function initCategoryList({ signal } = {}) {
  resetChildStyles();

  if (didInit) {
    return;
  }

  didInit = true;
  if (signal) {
    document.addEventListener("click", handleCategoryClick, { signal });
  } else {
    document.addEventListener("click", handleCategoryClick);
  }
}
