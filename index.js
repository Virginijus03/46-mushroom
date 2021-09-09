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

    console.log('       ');
    //1. Isspausdinti, visu grybu pavadinimus ir ju kainas,
    // grybus isrikiuojant nuo brangiausio link pigiausio.
    sql = 'SELECT `mushroom`, `price` FROM `mushroom` ORDER BY `price` DESC';
    [rows] = await connection.execute(sql);
    console.log(`Grybai:`);
    let pavadinimas = '';
    let kaina = 0;
    for (let index = 0; index < rows.length; index++) {
        pavadinimas = rows[index].mushroom;
        kaina = rows[index].price;

        console.log(`${index + 1}) ${upperName(pavadinimas)} - ${kaina} EUR/kg`);
    }
    console.log('       ');

    //2. Isspausdinti, visu grybautoju vardus.
    sql = 'SELECT `name` FROM `gatherer`';
    [rows] = await connection.execute(sql);
    const vardai = rows.map(obj => obj.name);
    console.log(`Grybautojai: ${vardai.join(', ')}.`);
    console.log('       ');

    //3. Isspausdinti, brangiausio grybo pavadinima.
    sql = 'SELECT `mushroom` FROM `mushroom` WHERE `price` = (SELECT MAX(`price`) FROM `mushroom`)';
    [rows] = await connection.execute(sql);
    console.log(`Brangiausias grybas yra: ${upperName(rows[0].mushroom)}.`);
    console.log('       ');

    //4. Isspausdinti, pigiausio grybo pavadinima.
    sql = 'SELECT `mushroom` FROM `mushroom` WHERE `price` = (SELECT MIN(`price`) FROM `mushroom`)';
    [rows] = await connection.execute(sql);
    console.log(`Pigiausias grybas yra: ${upperName(rows[0].mushroom)}.`);
    console.log('       ');

    //5. Isspausdinti, visu kiek vidutiniskai reikia grybu,
    // jog jie svertu 1 kilograma (suapvalinti iki vieno skaiciaus po kablelio),
    // isrikiuojant pagal pavadinima nuo abeceles pradzios link pabaigos.
    sql = 'SELECT `mushroom`, (1000 / `weight`) as amount FROM `mushroom` ORDER BY `mushroom` ASC';
    [rows] = await connection.execute(sql);
    console.log('Grybai:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperName(item.mushroom)} - ${(+item.amount).toFixed(1)}`);
    }
    console.log('       ');

    //6
    sql = 'SELECT `name`, SUM(`count`) as amount FROM `basket` \
           LEFT JOIN `gatherer` \
               ON `gatherer`.`id` = `basket`.`gatherer_id` \
           GROUP BY `basket`.`gatherer_id` \
           ORDER BY `name`';
    [rows] = await connection.execute(sql);
    console.log('Grybu kiekis pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperName(item.name)} - ${item.amount} grybu`);
    }
    console.log('       ');

    //7
    sql = 'SELECT `name`, SUM(`count`*`price`*`weight`/1000) as amount FROM `basket` \
            LEFT JOIN `gatherer` \
                ON `gatherer`.`id` = `basket`.`gatherer_id` \
            LEFT JOIN `mushroom`\
                ON `mushroom`.`id` = `basket`.`mushroom_id` \
            GROUP BY `basket`.`gatherer_id` \
            ORDER BY `amount` DESC ';
    [rows] = await connection.execute(sql);
    console.log('Grybu krepselio kainos pas grybautoja:');
    i = 0;
    for (const item of rows) {
        console.log(`${++i}) ${upperName(item.name)} - ${+item.amount} EUR`);
    }
    console.log('       ');

    //**8** _Isspausdinti, kiek nuo geriausiai vertinamu iki blogiausiai vertinamu grybu yra surinkta. Spausdinimas turi atlikti funkcija (pavadinimu `mushroomsByRating()`), kuri gauna vieninteli parametra - kalbos pavadinima, pagal kuria reikia sugeneruoti rezultata_
    async function mushroomByRating(lang) {

        const langList = ['en', 'lt'];

        lang = langList.includes(lang) ? lang : langList[0];

        sql = 'SELECT `ratings`.`id`, `name_' + lang + '`, SUM(`count`) as amount\
        FROM `ratings`\
        LEFT JOIN `mushroom`\
            ON `mushroom`.`rating`=`ratings`.`id`\
        LEFT JOIN `basket`\
            ON `basket`.`mushroom_id` =`mushroom`.`id`\
        GROUP BY `ratings`.`id`\
        ORDER BY `ratings`.`id` DESC';
        [rows] = await connection.execute(sql);
        console.log(rows);

        // if (lang === 'lt') {

        //     console.log(`Grybu kiekis pagal ivertinima:`);
        //     for () {
        //         console.log(`5 zvaigzdutes (labai gerai) - 5 grybai`);
        //     }
        // }
    }
    mushroomByRating('lt');
    mushroomByRating('en');
    console.log('       ');

    //9 Isspausdinti, visus grybus,
    // kuriu ivertinimas geresnis arba lygus 4 zvaigzdutem, 
    //isrikiuotus gerejimo tvarka
    //pvz.: Grybai: Grybas, Grybas, Grybas.
    sql = 'SELECT `rating`, `mushroom` FROM `mushroom`\
    ORDER BY `rating` ASC';
    [rows] = await connection.execute(sql);
    let grybai = [];
    for (let i = 0; i < rows.length; i++) {
        ratingMushroom = rows[i].rating;
        if (ratingMushroom >= 4) {
            grybai.push(upperName(rows[i].mushroom));
        }
    }
    console.log(`Grybai: ${grybai.join(', ')}.`);


}

app.init();

module.exports = app;