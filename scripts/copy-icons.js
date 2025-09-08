#!/usr/bin/env node

/**
 * Script per copiare automaticamente le icone dei progetti
 * Cerca le icone nelle cartelle dei progetti e le copia in src/images/icons/
 */

const fs = require('fs-extra');
const path = require('path');

const ICON_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
const ICON_NAMES = ['icon', 'logo', 'app-icon', 'app-logo'];

async function copyProjectIcons() {
  
  const noticesDir = path.join(__dirname, '..', 'notices');
  const iconsDir = path.join(__dirname, '..', 'src', 'images', 'icons');
  
  // Assicurati che la cartella delle icone esista
  await fs.ensureDir(iconsDir);
  
  try {
    const projects = await fs.readdir(noticesDir);
    
    for (const project of projects) {
      const projectPath = path.join(noticesDir, project);
      const stat = await fs.stat(projectPath);
      
      if (stat.isDirectory()) {
        await copyIconForProject(project, projectPath, iconsDir);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore durante la copia delle icone:', error.message);
  }
}

async function copyIconForProject(projectId, projectPath, iconsDir) {
  try {
    // Cerca un'icona nella cartella del progetto
    const files = await fs.readdir(projectPath);
    
    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        const name = path.basename(file, ext).toLowerCase();
        
        // Controlla se è un'icona valida
        if (ICON_EXTENSIONS.includes(ext) && ICON_NAMES.some(iconName => name.includes(iconName))) {
          const targetPath = path.join(iconsDir, `${projectId}-icon${ext}`);
          
          // Copia l'icona
          await fs.copy(filePath, targetPath);
          return;
        }
      }
    }
    
    // Se non trova un'icona, crea un placeholder
    await createPlaceholderIcon(projectId, iconsDir);
    
  } catch (error) {
    console.error(`❌ Errore per progetto ${projectId}:`, error.message);
  }
}

async function createPlaceholderIcon(projectId, iconsDir) {
  const placeholderPath = path.join(iconsDir, `${projectId}-icon.svg`);
  
  // SVG placeholder semplice
  const placeholderSvg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="8" fill="#f3f4f6"/>
  <rect x="12" y="12" width="24" height="24" rx="4" fill="#d1d5db"/>
  <text x="24" y="28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#6b7280">${projectId.toUpperCase()}</text>
</svg>`;
  
  await fs.writeFile(placeholderPath, placeholderSvg);
}

// Esegui lo script se chiamato direttamente
if (require.main === module) {
  copyProjectIcons();
}

module.exports = { copyProjectIcons };
