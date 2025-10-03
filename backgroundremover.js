let net;
const videoElement = document.getElementById("inputVideo");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");
const errorDiv = document.getElementById("error");

async function loadBodyPix() {
  net = await bodyPix.load();
  console.log("BodyPix model loaded.");
}

function canPlay(file) {
  const type = file.type;
  return videoElement.canPlayType(type) !== "";
}

document.getElementById("videoUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!canPlay(file)) {
    errorDiv.textContent = "Browser Can't Play this type";
    return;
  }

  errorDiv.textContent = "";
  const url = URL.createObjectURL(file);
  videoElement.src = url;
  videoElement.load(file);

  videoElement.addEventListener(
    "loadeddata",
    () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      //removeBackground();
    },
    { once: true }
  );

  videoElement.play().catch((err) => console.log("Play error", err));
});

async function removeBackground() {
  if (!net) return;
  if (videoElement.paused || videoElement.ended)
    return requestAnimationFrame(removeBackground);

  const segmentation = await net.segmentation(videoElement, {
    flipHorizontal: false,
    internalResolution: "medium",
    segmentationThreshold: 0.7,
  });

  const maskBackground = bodyPix.toMask(
    segmentation,
    { r: 0, g: 0, b: 0, a: 0 },
    { r: 0, g: 255, b: 0, a: 255 }
  );
  ctx.clearRect(0, 0, canvas.height);
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  ctx.putImageData(maskBackground, 0, 0);

  requestAnimationFrame(removeBackground);
}

loadBodyPix();
