var mongoose = require('mongoose');
var keys = require('./config/keys');
var Product = require('./models/product-model');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var json2csv = require('json2csv');
var Json2csvParser = require('json2csv').Parser;
var fields = ['productName', 'brand', 'productNum', 'cafe24Code', 'SKU', 'realprice', 'taxtype', 'taxrate', 'createdate'];
var json2csvParser = new Json2csvParser({ fields });
var encoding = require("encoding");
var iconv = require('iconv-lite');
var json2xls = require('json2xls');

/*
// keys.mongodb.dbURI에 해당하는 mongodb에 연결하기
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('Connected to mongodb');
});
*/

mongoose.connect(keys.mongodb.dbURI, function(err,gget){
    if(err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});

// Bearer 뒤는 access token으로 access token이 변경되면 값을 바꾸어야 한다.
var token = {
    headers: {"Authorization": "Bearer RZx3LzRQM9glfeycEE7PAK"}
};

var str1 = "https://platformfactory.cafe24api.com/api/v2/admin/products?limit=100&offset=100";


client.get(str1, token, function(data, response) {
    var products = data.products; // data가 products를 포함하고 그 안의 객체를 불러오는 것이기 때문에 이렇게 사용한다.
    //console.log(products);
    var xls = json2xls(products,
        {
          fields: ['product_name', 'product_no', 'product_code', 'supply_product_name', 'price', 'tax_amount', 'created_date']
        });
    fs.writeFileSync('data.xlsx', xls, 'binary');
    console.log("File Saved");
});

var brandArr = [];
var productNameArr = [];
var productNumArr = [];
var cafe24CodeArr = [];
var skuArr = [];
var priceArr = [];
var taxtypeArr = [];
var taxrateArr = [];
var dateArr = [];

// 각각의 사항들을 배열에 넣기 ProductName이랑 ProductNum 등의 행을 배열로 저장
client.get(str1,token,function(data, response){
    var stringdata = JSON.stringify(data).substring(13);
    for(var index=1; index<=100; index++) { // 인덱스는 limit의 수에 맞게 설정해야 한다.
        var partstring = stringdata.split("shop_no")[index]; // 여기 인덱스를 반복문 써서 돌리기
        // 각각의 사항 저장 시작
        
        var partproductname = partstring.split("product_name")[1] // 이거는 냅둬야 한다.
        var realproductname = partproductname.substr(3,partproductname.length-10);
        productNameArr.push(realproductname);
        
        var partpartbrand = partstring.split("product_name")[1].split("\"")[2];
        try { // 때로는 예약배송이 앞에 적혀 있는 경우가 있는데, 이를 거르기 위한 코드
            var brandname = partpartbrand.split("\[")[2];
            var realbrand = brandname.split("\]")[0];
        } catch(err) {
            var brandname = partpartbrand.split("\[")[1];
            var realbrand = brandname.split("\]")[0];
        }
        brandArr.push(realbrand);

        var partproductnum = partstring.split("product_no")[1].split("\"")[1];
        var realproductnum = partproductnum.substr(1,partproductnum.length-2);
        productNumArr.push(realproductnum);
        
        var partcafe24Code = partstring.split("product_code")[1];
        var realcafe24Code = partcafe24Code.substr(3,partcafe24Code.length-13);
        cafe24CodeArr.push(realcafe24Code);
        
        var realSKU = partstring.split("supply_product_name")[1].split("\"")[2];
        skuArr.push(realSKU);
        
        var realprice = partstring.split("price")[1].split("\"")[2];
        priceArr.push(realprice);
        
        var realtaxtype = partstring.split("tax_type")[1].split("\"")[2];
        taxtypeArr.push(realtaxtype);
        
        var parttaxrate = partstring.split("tax_amount")[1].split("\"")[1];
        var realtaxrate = parttaxrate.substr(1,parttaxrate.length-2);
        taxrateArr.push(realtaxrate);
        
        var realdate = partstring.split("created_date")[1].split("\"")[2];
        dateArr.push(realdate);

        // product-model.js 파일에 있는 스키마에 맞게 mongoDB에 저장하는 과정 
        new Product({
            productName: productNameArr[index-1],
            brand: brandArr[index-1],
            productNum: productNumArr[index-1],
            cafe24Code: cafe24CodeArr[index-1],
            SKU: skuArr[index-1],
            realprice: priceArr[index-1],
            taxtype: taxtypeArr[index-1],
            taxrate: taxrateArr[index-1],
            createdate: dateArr[index-1]
        }).save(function(err,result){
            if(err) throw err;
            if(result) {
                console.log(result);
            }
        })
    }
})
