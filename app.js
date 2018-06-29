var mongoose = require('mongoose');
var keys = require('./config/keys');
var Item = require('./models/item_model');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var json2xls = require('json2xls');

// Bearer 뒤는 access token으로 access token이 변경되면 값을 바꾸어야 한다.
var token = {
    headers: {"Authorization": "Bearer Anvh4ElCBFYuGiTUKEZgfF"}
};

var strArray = [];
var receiverArray = [];
var idArray = ["20180323-0000017", "20180625-0000022"]; // "20180323-0000017" ← 한 주문번호에 앤더슨벨 제품이 2개 들어가 있는 주문번호
// cafe24 관리자페이지에서 상품준비중 관리에 들어있는 앤더슨벨 상품의 주문번호를 수동으로 입력해준다. (이거는 별로 안 걸리니까..) 여기만 수동으로 입력해주면 끝임
// 단, item[0]이 앤더슨벨인 제품만 넣어주어야 한다. item[1]이나 item[2]에 앤더슨벨이 있건 다른 브랜드가 있건 그건 상관없음
// item[0]과 item[1]이 둘 다 앤더슨벨이라면, "코드를 다시 실행시키세요, 제품이 제대로 들어가지 않았습니다."라는 멘트가 안 뜨고 'Item File Saved', 'Receiver File Saved'라는 문구만 뜰 때까지 계속 코드를 수행시키면 된다.
// 즉, 이 코드는 한 주문번호에 각기 다른 앤더슨벨 제품이 2개 이하로 들어간 경우만 처리가 가능하다. 3개 이상의 상품을 주문하는 경우는 코드상에서 너무 중첩이 되기에 구현 X. 쭉 확인한 결과, 1년간 3개 이상의 앤더슨벨 상품을 한 번에 주문한 경우는 없었음
// 만약, item[1]에 앤더슨벨 제품이 없고 item[2]에 앤더슨벨 제품이 있다면 item[1]의 인덱스 1을 2로 바꾸기만 하면 된다.
for(var index=0; index<=idArray.length-1;index++) {
    var str = "https://platformfactory.cafe24api.com/api/v2/admin/orders/" + idArray[index] +"/items";
    strArray.push(str); // data를 불러오기 위한 URL을 strArray에 일일이 저장 -> 일일이 호출하려고 배열로 모아두는 것
    var receiver = "https://platformfactory.cafe24api.com/api/v2/admin/orders/" + idArray[index] +"/receivers";
    receiverArray.push(receiver);
}

var orderdateArray = [];
var orderIdArray1 = [];
var productcodeArray = [];
var nameArray = [];
var optiononeArray = [];
var quantityArray = [];
var priceArray = [];
var jsonArray = [];
var receivernameArray = [];
var receiverphoneArray = [];
var receiverzipArray = [];
var receiveraddressArray = [];
var receiverjsonArray = [];

for(var index=0; index<=strArray.length-1;index++) {
    client.get(strArray[index], token, function(data, response) { // API 호출 가즈아아아아아아아아
        var item = data.items; // items 객체만 뽑아내기
        var bufferlength = idArray.length; // 절대, 주석처리해서는 안 되는 bufferlength 정의문
        // 그냥 item이 아니라 item[0]을 해주는 이유: 각각의 key에 해당하는 값을 불러오기 위해서
        // 단 item[0]이라고 해놓았기 때문에 각각의 주문번호에서 맨 처음에 나오는 것밖에 처리하지 못한다.
        //console.log(item); // order item API의 구조를 확인하고 싶다면 주석을 해제해 console.log(item)을 해보자. 당연히 이 밑의 내용은 전부 주석처리해야 됨 (/* */을 이 밑의 줄부터 "여기가 주석 자리이다."라고 써진 데까지)
        
        // 여기 있는 정보는 https://developer.cafe24.com/docs/api/admin/#list-all-orders-items의 형태의 API를 받아온 것입니다.
        var orderdate = "\"" + item[0].order_item_code.split("-")[0] + "\"";
        var orderId = "\"" + item[0].order_item_code.split("-")[0] + "-" + item[0].order_item_code.split("-")[1] + "\""; // 객체로 변환할 때 큰따옴표가 필요해서 미리 넣어준다.
        var productname = item[0].supplier_product_name;
        var itemname = "\"" + item[0].product_name.split("BELL]")[1] + "\"";
        var bracketcolor = "("+ item[0].product_name.split("(")[1]; // 색상이 필요한데, 색상 정보가 order API의 product_name의 괄호 안에 있기에 반드시 product_name을 불러와야 한다.
        var nobracketcolor = item[0].product_name.split("(")[1].split(")")[0]; // 색상이 필요한데, 색상 정보가 order API의 product_name의 괄호 안에 있기에 반드시 product_name을 불러와야 한다.
        // 괄호가 있는 것과 괄호가 없는 것을 나누는 이유: 상품코드에는 괄호가 있어야 되고 옵션1에는 괄호가 없어야 하기 때문에
        if(item[0].option_value == '') {
            var size = "F"; // 사이즈에 대한 정보가 없으면 사이즈를 F로 설정한다.
        } else {
            var size = item[0].option_value.split("=")[1]; // "사이즈=M" 이런 식으로 담겨있기에 = 뒤의 내용만 뽑아온다.
        }
        var productcode = "\"" + productname + bracketcolor + size + "\""; // 객체로 변환할 때 큰따옴표가 필요해서 미리 넣어준다.
        var optionone = "\"" + nobracketcolor + ":" + size + "\""; // 객체로 변환할 때 큰따옴표가 필요해서 미리 넣어준다.
        var quantity = "\"" + item[0].quantity + "\"";
        var price = item[0].product_price.split(".00")[0]; // 소숫점 NO 쓸모
        orderdateArray.push(orderdate);
        orderIdArray1.push(orderId); // 각각의 정보를 엑셀로 넣는 게 목적이기에 배열에 넣어둔다.
        productcodeArray.push(productcode);
        nameArray.push(itemname);
        optiononeArray.push(optionone);
        quantityArray.push(quantity);
        priceArray.push(price);
        
        if(typeof item[1] != "undefined") {
            if(item[1].supplier_id == "S00000DN") {
                bufferlength +=1; // 앤더슨벨 제품만 2개 주문한 경우
                var orderdate1 = "\"" + item[1].order_item_code.split("-")[0] + "\"";
                var orderId1 = "\"" + item[1].order_item_code.split("-")[0] + "-" + item[1].order_item_code.split("-")[1] + "\"";
                var productname1 = item[1].supplier_product_name;
                var itemname1 = "\"" + item[1].product_name.split("BELL]")[1] + "\"";
                var bracketcolor1 = "("+ item[1].product_name.split("(")[1]; 
                var nobracketcolor1 = item[1].product_name.split("(")[1].split(")")[0]; 
                if(item[1].option_value == '') {
                    var size1 = "F";
                } else {
                    var size1 = item[1].option_value.split("=")[1];
                }
                var productcode1 = "\"" + productname1 + bracketcolor1 + size1 + "\"";
                var optionone1 = "\"" + nobracketcolor1 + ":" + size1 + "\"";
                var quantity1 = "\"" + item[1].quantity + "\"";
                var price1 = item[1].product_price.split(".00")[0];
                orderdateArray.push(orderdate1);
                orderIdArray1.push(orderId1);
                productcodeArray.push(productcode1);
                nameArray.push(itemname1);
                optiononeArray.push(optionone1);
                quantityArray.push(quantity1);
                priceArray.push(price1);
 
                if(productcodeArray.length == bufferlength) { // 이 조건문 하에서는 배열이 다 채워진 상태라는 게 확실하므로 굳이 callback을 사용할 이유가 없다. 사실 완전 꼼수를 쓴 것.
                    for(var index=0; index<=orderIdArray1.length-1; index++) {
                        var jsonstr = "{ \"주문일자\": " + orderdateArray[index] + ", \n \"주문번호\": " + orderIdArray1[index] + ", \n \"상품코드\": " + productcodeArray[index] + ", \n \"상품명\": " + nameArray[index]
                                        + ", \n \"옵션1\": " + optiononeArray[index] + ", \n \"수량\": " + quantityArray[index] + ", \n \"납품가\": " + priceArray[index] + ", \n \"정상가\": " + priceArray[index] + "}";
                        jsonArray.push(jsonstr); // 아예 header를 미리 지정해버림 
                    }
                    var jsonstring = "["; // 객체로 돌리려면 대괄호가 필요하더라구요.
                    for(var index=0; index<=jsonArray.length-2; index++) {
                        jsonstring += jsonArray[index] + ",\n";
                    }
                    jsonstring += jsonArray[jsonArray.length-1] + "]"; // 마찬가지
                    var realjson = JSON.parse(jsonstring);
                    var xls = json2xls(realjson);
                    fs.writeFileSync('앤더슨벨아이템리스트.xlsx', xls, 'binary');
                    console.log("Item File Saved");
                } else {
                    // 2개 이상의 제품이 들어있지만 비동기적 특성 때문에 제대로 안 된 경우
                    console.log("코드를 다시 실행시키세요, 제품이 제대로 들어가지 않았습니다.");
                }
            } else {
                // supplier_id가 앤더슨벨이 아닌 경우 PASS
            }
        } else {
            // item[1]이 존재하지 않는 경우 (undefined), 당연히 이 경우에도 엑셀로 만들어주는 과정이 필요하다. (이 경우가 대부분)
            if(productcodeArray.length == bufferlength) { // 이 조건문 하에서는 배열이 다 채워진 상태라는 게 확실하므로 굳이 callback을 사용할 이유가 없다. 완전 꼼수
                for(var index=0; index<=orderIdArray1.length-1; index++) {
                    var jsonstr = "{ \"주문일자\": " + orderdateArray[index] + ", \n \"주문번호\": " + orderIdArray1[index] + ", \n \"상품코드\": " + productcodeArray[index] + ", \n \"상품명\": " + nameArray[index]
                                    + ", \n \"옵션1\": " + optiononeArray[index] + ", \n \"수량\": " + quantityArray[index] + ", \n \"납품가\": " + priceArray[index] + ", \n \"정상가\": " + priceArray[index] + "}";
                    // jsonstr은 header와 그에 해당하는 정보를 담는 문자열이다. 모든 변형이 다 끝나면 jsonstr을 객체로 변환한 뒤 객체화된 jsonstr을 json2xls의 parameter로 쓸 것이다.
                    jsonArray.push(jsonstr); // 코드를 돌릴 때마다 element들 간의 순서는 달라질 수 있어도 일관성은 변하지 않는다.
                    // 이제 모든 jsonstr은 jsonArray에 들어간 상태임
                }
                var jsonstring = "["; // 대괄호를 넣는 이유는 json2xls의 parameter에 부합하도록 양식을 맞추어주기 위함이다. (여러 개를 넣는 거니까 대괄호가 반드시 필요하다.)
                for(var index=0; index<=jsonArray.length-2; index++) {
                    jsonstring += jsonArray[index] + ",\n"; // 맨 뒤의 정보를 제외하고는 쉼표가 있어야 되니까, 이 식은 각각에 쉼표를 넣어준 것에 불과함 
                }
                jsonstring += jsonArray[jsonArray.length-1] + "]"; // 맨 뒤의 정보는 쉼표 대신에 대괄호가 필요하니까 대괄호를 넣어준다.
                var realjson = JSON.parse(jsonstring); // JSON.parse를 써서 문자열이었던 jsonstring이 JSON object인 realjson으로 변형됨
                var xls = json2xls(realjson); // json2xls를 통해 바로 엑셀로 넣을 수 있게 설정!
                fs.writeFileSync('앤더슨벨아이템리스트.xlsx', xls, 'binary'); // 파일로 만들기
                console.log("Item File Saved"); // 끝
            }
        }
    })
    client.get(receiverArray[index], token, function(data, response) { // 수령자 정보를 뽑아내는 메소드 원리는 동일
        var bufferlength = idArray.length;
        var receiver = data.receivers;
        var receivername = "\"" + receiver[0].name + "\"";
        receivernameArray.push(receivername);
        var receiverphone = "\"" + receiver[0].cellphone + "\"";
        receiverphoneArray.push(receiverphone);
        var receiverzipcode = "\"" + receiver[0].zipcode + "\"";
        receiverzipArray.push(receiverzipcode);
        var receiveraddress = "\"" + receiver[0].address1 + " " + receiver[0].address2 + "\"";
        receiveraddressArray.push(receiveraddress);
        if(receivernameArray.length == bufferlength) {
            for(var index=0; index<=receivernameArray.length-1; index++) {
                var jsonstr = "{ \"수취인\": " + receivernameArray[index] + ", \n \"연락처\": " + receiverphoneArray[index] + ", \n \"수취인핸드폰번호\": " + receiverphoneArray[index]
                                + ", \n \"수취인우편번호\": " + receiverzipArray[index] + ", \n \"배송지\": " + receiveraddressArray[index] + "}";
                receiverjsonArray.push(jsonstr);
            }
            var jsonstring = "[";
            for(var index=0; index<=receiverjsonArray.length-2; index++) {
                jsonstring += receiverjsonArray[index] + ",\n";
            }
            jsonstring += receiverjsonArray[receiverjsonArray.length-1] + "]";
            var realjson = JSON.parse(jsonstring);
            var xls = json2xls(realjson);
            fs.writeFileSync('앤더슨벨수령자리스트.xlsx', xls, 'binary');
            console.log("Receiver File Saved");
        }
        // 여기가 주석 자리이다.
        
    })
};