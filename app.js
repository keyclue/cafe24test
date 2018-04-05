var mongoose = require('mongoose');
var keys = require('./config/keys');
var Receiver = require('./models/receiver_model');
var Client = require('node-rest-client').Client;
var client = new Client();
var date = new Date();

// keys.mongodb.dbURI에 해당하는 mongodb에 연결하기
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('Connected to mongodb');
});

var args = {
    headers: {"Authorization": "Basic cDdOMmtnWENPWnNuWVRDZVN3WmpwRDpUWDNIb3QwbEFoY3RmQXRsdUVZa2pC",
        "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {"grant_type": "authorization_code",
        "code": "QcwFHoxSIVfDv4ANWC565E",
        // code는 브라우저에서 받아온다. https://platformfactory.cafe24.com/api/v2/oauth/authorize?response_type=code&client_id=p7N2kgXCOZsnYTCeSwZjpD&state=lgtwins&redirect_uri=https%3A%2F%2Fkeyclue-test.herokuapp.com&scope=mall.read_product,mall.read_order
        "redirect_uri": "https://keyclue-test.herokuapp.com"}
};

/*
// Access token 받은 후에 주석 처리
client.post("https://platformfactory.cafe24api.com/api/v2/oauth/token", args, function(data, response) {
    console.log(data);
})
*/

// Bearer 뒤는 access token으로 access token이 변경되면 값을 바꾸어야 한다.
var token = {
    headers: {"Authorization": "Bearer FDlEbsdJNlLkSsx2l0ecVB"}
};

// DB에 저장하기 위해 필요한 문자열들
//다만, order_status는 확인이 필요하다. limit는 검색하는 개수를 의미
var str = "https://platformfactory.cafe24api.com/api/v2/admin/orders";
var missingstr = "{\"shop_no";
var findstr = "?start_date=2018-04-03&end_date=2018-04-03&order_status=N10,N20&limit=100";
var orderIdArray = [];
var receiverArray = [];


// Access token 없으면 주석 처리 (중복을 걸러내지 못하는 코드)
// 돌리기 전에 objtest.order_id 먼저 확인하자!!! 첫 번째 for 이후로 주석처리
client.get(str+findstr, token, function(data, response) {
    //console.log(data); // 이거 주석 해제하고 확인해야 인덱스의 올바른 숫자 파악 가능함
    var stringdata = JSON.stringify(data).substring(11);
    
    try {
        for(var index=1; index<=3; index++) {
            var partstring = stringdata.split("shop_no")[index]; // 인덱스는 해당 기간 동안 팔린 아이템의 개수
            // 일단 Index를 크게 설정해두자. 실행시키면 에러가 뜰텐데, 에러 전까지 나온 리스트의 개수에 1을 더하면 총 아이템의 개수가 된다.
            // Index를 그 숫자에 맞게 설정하면 모든 order_id를 볼 수 있다.
            var partpartstring = partstring.substr(0,partstring.length-3);
            if(index==3) {
                var finalstr = missingstr + partpartstring + '}';
            } else {
                var finalstr = missingstr + partpartstring;
            }
            var objtest = JSON.parse(finalstr);
            //console.log(objtest); // 이거 주석 해제하고 확인하기
            orderIdArray.push(objtest.order_id);
            // 이제 orderIdArray에 저장되어있음
        };
        // 이 밑으로 주석 기호 달기

        var orderIdstr = JSON.stringify(orderIdArray);
        var partorderIdstr = orderIdstr.substr(1,orderIdstr.length-2);
        var partorderIdstr = partorderIdstr.replace(/"/gi, '');
        var res = partorderIdstr.split(',');
        for(var index=0; index<=res.length-1; index++) {
            var partreceiverstr = str + "/" + res[index] + "/" + "receivers";
            receiverArray.push(partreceiverstr);
        };
        for(var index=0; index<=receiverArray.length-1; index++) {
            client.get(receiverArray[index], token, function(data, response) {
                //console.log(typeof(data));
                var stringdata = JSON.stringify(data).substring(14);
                var finalstr = stringdata.substr(0, stringdata.length-2);
                var receiverobj = JSON.parse(finalstr);
                new Receiver({
                    receiverName: receiverobj.name,
                    receiverPhone: receiverobj.cellphone,
                    receiverZipcode: receiverobj.zipcode,
                    receiverAddress: receiverobj.address1 + " " + receiverobj.address2
                }).save().then((newReceiver) => {
                    //console.log('New receiver created: ', newReceiver);
                    //newReceiver는 자바스크립트 object 상태
                    var jsonReceiver = newReceiver.toJSON();
                    console.log(jsonReceiver);
                });
            })
        };
       // 여기까지 주석기호 달기
      
    } catch(err) {
        console.log("Error");
    }
    
})
