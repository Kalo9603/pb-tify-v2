# pb-tify-v2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E=16-green.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

**pb-tify-v2** is a template project based on [`pb-extension-template`](https://github.com/eeditiones/pb-extension-template).  
It extends the functionalities of **pb-tify** by introducing advanced features for IIIF manifest visualization, annotation handling, and user interaction.

---

## ✨ Features

- Enhanced visualization of IIIF manifest **metadata** and **canvas metadata**
- Extended annotation support:
  - Create, edit, delete annotations
  - Visualize annotations directly on the canvas
  - Support for **administrative annotation management**
- Resource exploration tools:
  - Display of canvas **coordinates**
  - Additional exploration utilities
- **Markdown support** in annotation bodies
- Ready-to-use integration with TEI Publisher
- **Canvas snapshot** by manipulating **Image API**
- **Import and export manifests and annotations lists** that can be shared for research, study, academic and so on

---

## 🎓 Context

This project is part of the Master’s Degree program in  
[**Digital Humanities**](https://infouma.fileli.unipi.it/laurea-magistrale/) at the [**University of Pisa**](https://www.unipi.it/).  
It is developed as an extension of TEI Publisher’s component ecosystem and provides a practical example of how IIIF manifests and annotations can be handled within a web publishing environment.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

### Installation

`git clone https://github.com/Kalo9603/pb-tify-v2.git
npm start`

* `index.html` – demo interface with components
* `api.html` – generated API documentation

### Build

`npm run build:production`

The bundled files will be placed in the `dist/` directory.

## 📂 Project Structure

- `src/` – source code of the custom components  
- `pb-extension-bundle.js` – main entry point bundling all components  
- `index.html` – demo page for testing the components  
- `api.html` – auto-generated API documentation  
- `dist/` – output folder for production builds  

---

## 🔗 Integration with TEI Publisher

To use **pb-tify-v2** in a TEI Publisher app:

1. Add the dependency in your app’s `package.json`:
   `"pb-tify-v2": "git+https://github.com/Kalo9603/pb-tify-v2.git#master" `
2. In build.properties`, set:
    ` scripts.dir=dist `
3. In `modules/config.xqm`, ensure:
    ` declare variable $config:webcomponents := "local"; `
4. Rebuild your app with:
    ` ant xar-local `
5. If needed, copy translation files into `resources/i18n` to enable internationalization.

## 🛠 Roadmap

- Bugfixes
- Add further resource exploration tools  
- Extend UI/UX for annotation management  
- Provide demo datasets for testing  
- Expand documentation and tutorials  

---

## 📜 License

This project is released under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [TEI Publisher](https://teipublisher.com/)  
- [pb-extension-template](https://github.com/eeditiones/pb-extension-template)  
- [IIIF](https://iiif.io/) community and specifications  
- Master’s Degree program in [Digital Humanities](https://infouma.fileli.unipi.it/laurea-magistrale/) @ [University of Pisa](https://www.unipi.it/)

