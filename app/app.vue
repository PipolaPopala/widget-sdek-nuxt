<template>
  <div class="demo-page">
    <header class="demo-header">
      <h1>Демонстрация виджета СДЭК 3.0</h1>
      <p>Проект на Nuxt 4</p>
    </header>
    
    <main>
      <CdekWidget />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #fafafa;
}
.demo-page {
  padding: 40px 20px;
}
.demo-header {
  text-align: center;
  margin-bottom: 40px;
}
.demo-header h1 {
  margin: 0 0 10px 0;
  color: #333;
}
.demo-header p {
  margin: 0;
  color: #666;
}
</style>