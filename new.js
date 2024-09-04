async function initializeWasm(wasmExecUrl, wasmUrl, file, libheifInstance, callback) {
    callback("Start");

    try {
        // Load wasm_exec.js dynamically
        await loadWasmExecScript(wasmExecUrl, callback);
      callback("Loaded");
        const go = new Go(); // Go is now available after wasm_exec.js is loaded

        // Initial callback
        callback("Initialization started");

        // Load and instantiate the WebAssembly module
        await loadWasmModule(wasmUrl, go, callback);

        // Load and process the file if provided
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const buffer = e.target.result;

                    if (libheifInstance && typeof processHeifFile === 'function') {
                        processHeifFile(buffer, libheifInstance);
                        callback("processHeifFile executed successfully.");
                    } else {
                        callback("libheifInstance is not available or processHeifFile function is missing.");
                    }
                } catch (error) {
                    callback("Error during file processing: " + error.message);
                }
            };

            reader.onerror = function(error) {
                callback("File reading error: " + error.message);
            };

            try {
                reader.readAsArrayBuffer(file);
            } catch (error) {
                callback("Error starting file read: " + error.message);
            }
        } else {
            callback("File is not provided");
        }
    } catch (error) {
        callback("Initialization failed: " + error.message);
    }
}

// Function to load wasm_exec.js dynamically
function loadWasmExecScript(url, callback) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        
        // Handling the script load event
        script.onload = () => {
          callback(`Script loaded successfully from ${url}`);
            resolve();
        };
        
        // Handling script error event
        script.onerror = (error) => {
          callback(`Failed to load script from ${url}:`, error);
            reject(new Error(`Failed to load script from ${url}`));
        };

        // Append the script element to the document
        document.head.appendChild(script);
    });
}

// Function to load and instantiate the WebAssembly module
function loadWasmModule(url, go, callback) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.instantiate(bytes, go.importObject))
        .then(result => {
            go.run(result.instance);
            callback("WebAssembly module loaded and running");
        })
        .catch(error => {
            callback("Failed to load WebAssembly module: " + error.message);
        });
}



window.testCallback = testCallback;
