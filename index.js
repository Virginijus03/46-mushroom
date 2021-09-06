const mysql = require('mysql2/promise');

const app = {}

app.init = async () => {
    // prisijungti prie duomenu bazes
    const connection = await mysql.createConnection({   //[rows = [], felds = []]
        host: 'localhost',
        user: 'root',
        database: 'mushroom',
    });

    let sql = '';
    let rows = [];

    function upperName(str) {
        return str[0].toUpperCase() + str.slice(1);
    }

    //1. Isspausdinti, visu grybu pavadinimus ir ju kainas,
    // grybus isrikiuojant nuo brangiausio link pigiausio.
    sql = 'SELECT `mushroom`, `price` FROM `mushroom`';
    [rows] = await connection.execute(sql);
    console.log(`Grybai:`);
    let pavadinimas = '';
    let kaina = 0;
    for (let index = 0; index < rows.length; index++) {
        pavadinimas = rows[index].mushroom;
        kaina = rows[index].price;

        console.log(`${index + 1}) ${upperName(pavadinimas)} - ${kaina} EUR/kg`);
    }

    //2. Isspausdinti, visu grybautoju vardus.
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);
    const vardai = rows.map(obj => obj.name);
    console.log(`Grybautojai: ${vardai.join(', ')}.`);

    //3. Isspausdinti, brangiausio grybo pavadinima.

}

app.init();

module.exports = app;