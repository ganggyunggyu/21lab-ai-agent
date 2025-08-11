<template>
    <div class="typing-dots">
              <span></span><span></span><span></span>
            </div>
</template>

<style scoped>
.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  background: #888;
  border-radius: 50%;
  animation: blink 1.4s infinite both;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%, 80%, 100% { opacity: 0 }
  40% { opacity: 1 }
}
</style>