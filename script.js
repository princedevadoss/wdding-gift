const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const finalImg = document.getElementById("finalImage");
const wrapper = document.getElementById("wrapper");
const btn = document.getElementById("nextPartBtn");
const quoteOverlay = document.getElementById("quoteOverlay");

let canvasWidth, canvasHeight;
let particles = [];
let animationFrameId;
const PARTICLE_SIZE = 6;

const img = new Image();
img.src = "placeholder.jpg"; // Replace with your image path

class Particle {
  constructor(x, y, color) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.destX = x;
    this.destY = y;
    this.color = color;
    this.size = PARTICLE_SIZE;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.ease = 0.01;
  }

  update() {
    this.vx += (this.destX - this.x) * this.ease;
    this.vy += (this.destY - this.y) * this.ease;
    this.vx *= 0.8;
    this.vy *= 0.8;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size / 2);
    ctx.bezierCurveTo(
      this.x + this.size / 2,
      this.y - this.size / 2,
      this.x + this.size / 2,
      this.y + this.size / 4,
      this.x,
      this.y + this.size / 2
    );
    ctx.bezierCurveTo(
      this.x - this.size / 2,
      this.y + this.size / 4,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.x,
      this.y - this.size / 2
    );
    ctx.closePath();
    ctx.fill();
  }
}

function createParticles(imageData, offsetX, offsetY) {
  particles = [];
  const { width, height, data } = imageData;
  for (let y = 0; y < height; y += PARTICLE_SIZE) {
    for (let x = 0; x < width; x += PARTICLE_SIZE) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      if (a > 128) {
        const color = `rgba(${r},${g},${b},${a / 255})`;
        particles.push(new Particle(x + offsetX, y + offsetY, color));
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  let done = true;
  for (let p of particles) {
    p.update();
    p.draw(ctx);
    if (
      Math.abs(p.x - p.destX) > 0.5 ||
      Math.abs(p.y - p.destY) > 0.5
    ) {
      done = false;
    }
  }
  if (!done) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    finalImg.style.opacity = 1;
    canvas.style.opacity = 0;
    showButtonAfterImageReveal();
  }
}

function initCanvas() {
  canvasWidth = wrapper.clientWidth;
  canvasHeight = wrapper.clientHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const aspectRatio = img.width / img.height;
  let drawWidth = canvasWidth;
  let drawHeight = drawWidth / aspectRatio;

  if (drawHeight > canvasHeight) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * aspectRatio;
  }

  const offsetX = (canvasWidth - drawWidth) / 2;
  const offsetY = (canvasHeight - drawHeight) / 2;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  const imageData = ctx.getImageData(offsetX, offsetY, drawWidth, drawHeight);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  createParticles(imageData, offsetX, offsetY);
  animateParticles();
}

// Trigger animation on wrapper visible in viewport
img.onload = () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
          initCanvas();
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8 }
  );
  observer.observe(wrapper);
};

function showButtonAfterImageReveal() {
  wrapper.classList.add("revealed");
}

// Button click: fade out image, show quote overlay
btn.addEventListener("click", () => {
  wrapper.classList.add("quote-shown");
});
