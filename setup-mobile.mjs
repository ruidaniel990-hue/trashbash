#!/usr/bin/env node
// Mobile Access Setup Script for Trash bash

import os from 'os';
import { exec } from 'child_process';

const PORT = process.env.PORT || 3000;

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4 Adressen außer localhost
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function getQRCodeURL() {
  const ip = getLocalIP();
  return `http://${ip}:${PORT}`;
}

function printHeader() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                  🗑️  Trash bash - Handy Setup                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
}

function printInfo() {
  const qrURL = getQRCodeURL();
  const ip = getLocalIP();

  console.log('📱 HANDY ZUGRIFF KONFIGURATION\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ Serveradresse:');
  console.log(`   ${qrURL}\n`);

  console.log('📍 Lokale IP:');
  console.log(`   ${ip}:${PORT}\n`);

  console.log('QR Code für Handy:');
  console.log(`   Öffne: http://localhost:${PORT}/qr.html\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🚀 SCHRITT-FÜR-SCHRITT ANLEITUNG:\n');
  console.log('1️⃣  Stelle sicher, dass dein Handy im gleichen WiFi wie dein 📶');
  console.log('    Computer angeschlossen ist.\n');

  console.log('2️⃣  Öffne auf diesem Computer:');
  console.log(`    http://localhost:${PORT}/qr.html\n`);

  console.log('3️⃣  Scaniere den QR Code mit deinem Handy-Kamera.\n');

  console.log('4️⃣  Trash bash öffnet sich auf deinem Handy! 📱\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 TIPPS:\n');
  console.log('✨ URL direkt eingeben: ' + qrURL);
  console.log('🔗 Direkt in Browser-Address-Bar');
  console.log('📲 PWA: "Zum Home-Screen hinzufügen" wählen\n');

  console.log('🔧 OPTIONEN:\n');
  console.log('📋 URL kopieren und teilen (zum Share-Link)\n');
  console.log('🛠️  Firewall-Ports ggf. öffnen (Windows/Mac)\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🌐 BROWSER-APPS (ONLINE):\n');
  console.log('Alternativ kannst du auch einen Tunneling-Service nutzen:\n');
  console.log('1. ngrok: ngrok http ' + PORT);
  console.log('2. Vercel: Deployment auf Vercel/Netlify');
  console.log('3. GitHub Pages: Static Frontend hosting\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✅ OFFLINE FUNKTIONALITÄT:\n');
  console.log('Die App speichert automatisch Daten lokal auf deinem');
  console.log('Handy und funktioniert auch ohne Internet-Verbindung!\n');

  console.log('📦 SERVICE WORKER: sw.js registriert');
  console.log('💾 PWA MANIFEST: manifest.json geladen');
  console.log('📍 OFFLINE CACHE: Alle wichtigen Assets gepuffert\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function printFirewallWarning() {
  const osType = os.platform();

  console.log('⚠️  FIREWALL HINWEIS:\n');

  if (osType === 'win32') {
    console.log('Windows Firewall:');
    console.log('1. Öffne: "Defender Firewall mit Advanced Security"');
    console.log('2. Klick auf "Inbound Rules"');
    console.log('3. Neue Regel: "Allow Node.js on Port ' + PORT + '"');
    console.log('4. Oder: netsh advfirewall firewall add rule name="Trash bash" dir=in action=allow protocol=tcp localport=' + PORT + '\n');
  } else if (osType === 'darwin') {
    console.log('macOS:');
    console.log('Normalerweise keine Konfiguration nötig.');
    console.log('Im Zweifelsfall: System Preferences > Security & Privacy > Firewall Options\n');
  } else {
    console.log('Linux:');
    console.log('ufw allow ' + PORT + '\n');
  }
}

function openQRPage() {
  const qrUrl = `http://localhost:${PORT}/qr.html`;
  const osType = os.platform();
  let cmd;

  switch (osType) {
    case 'darwin':
      cmd = `open "${qrUrl}"`;
      break;
    case 'win32':
      cmd = `start ${qrUrl}`;
      break;
    default:
      cmd = `xdg-open "${qrUrl}"`;
  }

  console.log('\n🌐 Öffne QR Code Seite automatisch...\n');
  exec(cmd, (err) => {
    if (err) {
      console.log(`⚠️  Bitte manuell öffnen: ${qrUrl}`);
    }
  });
}

// Main
printHeader();
printInfo();
printFirewallWarning();
openQRPage();

console.log('🎉 Trash bash ist jetzt auch auf deinem Handy erreichbar!');
console.log('📱 Viel Spaß beim Sammeln! ♻️\n');
