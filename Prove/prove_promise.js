function mostra(stringa){
    console.log(stringa)
}

let valore=true
const promessa= new Promise(function (risolto, rifiutato){
    if (valore) risolto("OK")
    else rifiutato("Errore")
})

promessa.then(mostra, mostra)


fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then(x => mostra("File esiste"), x=> mostra("File non esiste"))
