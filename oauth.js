var Client = require('node-rest-client').Client;
var client = new Client();

var args = {
    headers: {"Authorization": "Basic cDdOMmtnWENPWnNuWVRDZVN3WmpwRDpUWDNIb3QwbEFoY3RmQXRsdUVZa2pC",
        "Content-Type": "application/x-www-form-urlencoded"
    },
    data: {"grant_type": "authorization_code",
        "code": "8RxokGtJM5KljSa0mwgrXD",
        // code는 브라우저에서 받아온다. https://platformfactory.cafe24.com/api/v2/oauth/authorize?response_type=code&client_id=p7N2kgXCOZsnYTCeSwZjpD&state=lgtwins&redirect_uri=https%3A%2F%2Fanderssonbell.herokuapp.com&scope=mall.read_product,mall.read_order
        // 안 되면 이걸로 해보세요. https://platformfactory.cafe24.com/api/v2/oauth/authorize?response_type=code&client_id=p7N2kgXCOZsnYTCeSwZjpD&state=lgtwins&redirect_uri=https%3A%2F%2Fkeyclue-test.herokuapp.com&scope=mall.read_product,mall.read_order
        "redirect_uri": "https://keyclue-test.herokuapp.com"}
};


// Access token 받은 후에 주석 처리
client.post("https://platformfactory.cafe24api.com/api/v2/oauth/token", args, function(data, response) {
    console.log(data);
})