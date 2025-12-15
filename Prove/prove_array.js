let ar =["Paolo", "Giulio", "Luigi"]

console.log("PROVA ARRAY")
console.log(ar.sort())

function filtraArray(x){
    return x=="Paolo"
}

console.log(ar.filter(filtraArray))
console.log(ar.filter(function (x){
    return x[0]=="L"
}))

console.log(ar.filter(x=> x[0]=="G"))
