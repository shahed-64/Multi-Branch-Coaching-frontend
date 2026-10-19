<template>
  <div class="restricted-page">
    <div class="restricted-card">
      <div class="restricted-icon">🚫</div>

      <h1>Access Denied</h1>

      <p>You are not authorized to access this system.</p>

      <p class="sub-text">Please contact your administrator if you need access.</p>
    </div>
  </div>
</template>

<style scoped>
.restricted-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f1f5f9;
  box-sizing: border-box;
}

.restricted-card {
  width: 100%;
  max-width: 480px;
  padding: 40px 30px;
  text-align: center;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.restricted-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

h1 {
  margin: 0 0 12px;
  color: #dc2626;
  font-size: 28px;
}

p {
  color: #374151;
  font-size: 16px;
  line-height: 1.6;
}

.sub-text {
  color: #6b7280;
  font-size: 14px;
}
</style>
