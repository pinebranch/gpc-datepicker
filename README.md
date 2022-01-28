# gpc-datepicker
Simple datepicker in javascript

## Run demo
    yarn
    yarn dev
    Access the demo in your web browser at: http://localhost:3000.

## Build
    yarn build

## Example
### Default
    <input type="text" id="datepicker">

    <script>
    let datepicker = new DatePicker(document.getElementById('datepicker'));
    </script>
### With options
    <input type="text" id="datepicker">

    <script>
    let datepicker = new DatePicker(document.getElementById('datepicker'), { //options });
    </script>
## Options
    {
        format: 'DD/MM/YYYY',
        minDate: null,
        maxDate: null,
        locale: 'vi', // 'en', 'vi'
        timepicker: null,
    }

    //Timepicker options
    timepicker: {
        minHour: 0,
        maxHour: 23,
        minuteStep: 5
    }
