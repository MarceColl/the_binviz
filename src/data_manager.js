let file_data
let curr_dataview
let data_size

let on_data_change_callbacks = []

function filter_data(offset, length) {
    curr_dataview = new DataView(file_data.buffer, offset, length)
}

function get_current_window() {
    return curr_dataview
}

function get_all_data() {
    return file_data
}

function get_data() {
    return curr_dataview
}

function when_data_changes(fn) {
    on_data_change_callbacks.push(fn)
}

function set_window(start, size) {
    curr_dataview = new DataView(file_data.buffer, start, size)
}

function load_file(file) {
    const reader = new FileReader();
    reader.onload = function () {
        file_data = new Uint8Array(this.result)

        for(const fn of on_data_change_callbacks) {
            fn()
        }
    }
    reader.readAsArrayBuffer(file)
}

module.exports = {
    filter_data,
    load_file,
    when_data_changes,
    get_all_data,
    set_window,
    get_data
}