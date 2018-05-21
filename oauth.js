var Client = require('node-rest-client').Client;
var client = new Client();

var args = {
    headers: {"Authorization": "Basic cDdOMmtnWENPWnNuWVRDZVN3WmpwRDpUWDNIb3QwbEFoY3RmQXRsdUVZa2pC",
        "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {"grant_type": "authorization_code",
        "code": "ArqRXyeNaqeqa0lsvRP13I",
        // code는 브라우저에서 받아온다. https://platformfactory.cafe24.com/api/v2/oauth/authorize?response_type=code&client_id=p7N2kgXCOZsnYTCeSwZjpD&state=lgtwins&redirect_uri=https%3A%2F%2Fkeyclue-test.herokuapp.com&scope=mall.read_product,mall.read_order
        "redirect_uri": "https://keyclue-test.herokuapp.com"}
};


// Access token 받은 후에 주석 처리
client.post("https://platformfactory.cafe24api.com/api/v2/oauth/token", args, function(data, response) {
    console.log(data);
})


/*
// DB에 저장하기 위해 필요한 문자열들
// json2csv 이용하는 version
var str = "https://platformfactory.cafe24api.com/api/v2/admin/products?limit=100&offset=";
var missingstr = "{\"shop_no";
var csvArray = [];
for(var off = 0; off<=100; off=off+100) {
    client.get(str+off, token, function(data, response) {
        // 'data'에 js 객체로 product information이 담겨져 있고, 'data'를 다음 코드로 수정시키면서 mongodb에 넣자.
        var stringdata = JSON.stringify(data).substring(13);
        try {
            for(var index=1; index<=100; index++) {
                var partstring = stringdata.split("shop_no")[index]; // 인덱스는 1부터 설정한 limit까지 
                var partpartstring = partstring.substr(0,partstring.length-3);
                if(index==100) {
                    var finalstr = missingstr + partpartstring + '}';
                } else {
                    var finalstr = missingstr + partpartstring;
                }
                var objtest = JSON.parse(finalstr);
        
                new Product({
                    productName: objtest.product_name,
                    productNum: objtest.product_no,
                    cafe24Code: objtest.product_code,
                    SKU: objtest.supply_product_name,
                    realprice: objtest.price,
                    taxtype: objtest.tax_type,
                    taxrate: objtest.tax_amount,
                    createdate: objtest.created_date
                    // (product_model에서 등록한 변수) : 객체이름.객체고유의변수
                }).save().then((newProduct) => {
                    //console.log('New product created: ', newProduct); // newProduct는 자바스크립트 객체형태
                    var csv = json2csvParser.parse(newProduct); // csv는 string의 형태
                    csvArray.push(csv);
                    return csvArray;
                }).then((csvArray) => {
                    if(csvArray.length==200) { // csvArray.length는 off의 개수에 맞추자.
                        
                        var finalstr = "\"productName\"\,\"productNum\"\,\"cafe24Code\"\,\"SKU\"\,\"realprice\"\,\"taxtype\"\,\"taxrate\"\,\"createdate\"\n"
                        for(var index=0; index<=csvArray.length-1; index++) {
                            var teststr = csvArray[index].substring(90).trim() + "\n";
                            finalstr = finalstr + teststr;
                        }
                        

                        // encoding package와 iconv-lite 사용
                        
                        var resultBuffer = encoding.convert(finalstr, 'utf8');
                        //var resstr = iconv.decode(resultBuffer,"utf8");
                        
                        fs.writeFile('file.csv', resultBuffer, function(err) {
                            if (err) throw err;
                            console.log('file saved');
                        });
                          
                    }
                    
                });
                
        }} catch(err) {
            console.log("Error");
        } 
    });
}
*/