const URL_COMUNI="https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";


const promessa2= fetch(URL_COMUNI);

promessa2.then(risposta1 => console.log("Risolta prima promise"));

/*.then() annidati, ogni then() riceve la promise di quello precedente*/
promessa2
        .then(risposta2 => risposta2.json() )
        .then(risposta3 => console.log("Funziona") )