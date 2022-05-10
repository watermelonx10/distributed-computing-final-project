async function getData() {
    const response = await fetch('https://reqres.in/api/users?page-2')
    const data = await response.json();
    return data;
}


getData().then(data => console.log(data));