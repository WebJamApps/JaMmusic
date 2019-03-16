exports.showSlides = function showSlides(idArray, doc) {
  let nullCounter = 0;
  idArray.forEach((id) => {
    const slides = doc.getElementById(id);
    if (slides !== null) {
      $(`#${id} > div:first`)
        .hide()
        .next()
        .fadeIn(1500)
        .end()
        .appendTo(`#${id}`);
    } else nullCounter += 1;
  });
  return Promise.resolve(nullCounter);
};
