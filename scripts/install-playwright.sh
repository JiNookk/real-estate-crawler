#!/bin/bash
# EC2에서 Playwright 브라우저 설치 스크립트

# 의존성 설치 (Amazon Linux 2)
sudo yum install -y \
  alsa-lib \
  atk \
  cups-libs \
  gtk3 \
  libXcomposite \
  libXdamage \
  libXrandr \
  pango \
  libdrm \
  libgbm \
  libxshmfence

# Playwright 브라우저 설치
npx playwright install chromium

echo "Playwright Chromium 설치 완료"
