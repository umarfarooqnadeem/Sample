async function initializeWasm(wasmExecUrl, wasmUrl, arrayBuffer, libheifInstance, callback) {
  try {
    callback("Start");

    // Step 1: Load wasm_exec.js dynamically and wait for its full load
    await loadWasmExecScript(wasmExecUrl, callback);
    callback("wasm_exec.js script loaded");

    // Step 2: Load and run the WebAssembly module
    await loadWasmModule(wasmUrl, callback);
    callback("WASM module loaded");

    // Step 3: Check if `processHeifFile` is available and process the file
    processHeifFile(new Uint8Array(arrayBuffer), libheifInstance, callback);
  } catch (error) {
    callback("Initialization failed: " + error.message);
  }
}
const toBlobURL = async (url, mimeType) => {
  const resp = await fetch(url);
  const body = await resp.blob();
  const blob = new Blob([body], { type: mimeType });
  return URL.createObjectURL(blob);
};
// Function to dynamically load wasm_exec.js
async function loadWasmExecScript(url, callback) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;

    script.onload = () => {
      callback(`Script loaded successfully from ${url}`);
      resolve();
    };

    script.onerror = (error) => {
      reject(new Error(`Failed to load script from ${url}: ${error.message}`));
    };

    document.head.appendChild(script);
  });
}

// Function to load and run the WebAssembly module
async function loadWasmModule(wasmUrl, callback) {
  return new Promise((resolve, reject) => {
    const go = new Go();
    WebAssembly.instantiateStreaming(toBlobURL(wasmUrl,"application/wasm"), go.importObject).then(result => {
      go.run(result.instance);
      resolve("OK");
    }).catch(error => {
      reject(new Error(`Failed to load WASM module: ${error.message}`));
    });
  });
}

// Example callback function
function testCallback(message) {
  console.log(message);
}

// Function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64); // atob() decodes the base64 string into a binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len); // Create a Uint8Array to hold the bytes
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}