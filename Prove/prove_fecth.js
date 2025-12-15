const URL_COMUNI="https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json";


const promessa2= fetch(URL_COMUNI);

promessa2.then(risposta1 => console.log("Risolta prima promise"));

/*.then() annidati, ogni then() riceve la promise di quello precedente*/
promessa2
        .then(risposta2 => risposta2.json() )
        .then(risposta3 => console.log("Funziona") )


let citta=""
let lat=0

async function caricaMeteo(){
        const nomeCitta="Padova"
        const URL_CITTA='https://geocoding-api.open-meteo.com/v1/search?name='+nomeCitta+"&language=it"

        const rispotaAPI = await fetch(URL_CITTA)
        const fielJSON = await rispotaAPI.json()

        citta=fielJSON.results[0].name
        lat=fielJSON.results[0].latitude
}
caricaMeteo()
        .then( x => {

          console.log(citta)
        console.log(lat)      
        })

