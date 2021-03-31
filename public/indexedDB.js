let dataBase;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const database = event.target.result;
  database.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  dataBase = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  let error = event.target.errorCode;
  console.log("Error " + error);
};

function saveRecord(record) {
  const transaction = dataBase.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = dataBase.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = dataBase.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      });
    }
  };
}
window.addEventListener("online", checkDatabase);