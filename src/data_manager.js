let file_data
let curr_dataview
let data_size
let analysis_segments
let curr_analysis

let on_data_change_callbacks = []

let segment_length = 1000

let changed = false

function filter_data(offset, length) {
    curr_dataview = new DataView(file_data.buffer, offset, length)
}

function get_current_window() {
    return curr_dataview
}

function get_current_analysis() {
    return curr_analysis
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
    curr_analysis = get_region_analysis(start, size)
    // curr_analysis.length = size
    changed = true
}

function has_changed() {
    past = changed
    changed = false
    return past
}

function analyze() {
    analysis_segments = []

    let segment = {}
    const length = file_data.byteLength
    for(let i = 0; i < length; ++i) {
        const idx = file_data[i] * 1000000 + file_data[i+1] * 1000 + file_data[i+2]
        if (segment[idx] === undefined) {
            segment[idx] = 1
        }
        else {
            segment[idx] += 1
        }

        if (i%1000 === 0 && i !== 0) {
            analysis_segments.push(segment)
            segment = {}
        }
    }
}

function get_region_analysis(start_byte, end_byte) {
    if (file_data === undefined)
        return

    const start_segment = Math.floor(start_byte/segment_length)
    const end_segment = Math.floor(end_byte/segment_length)

    const num_full_segments = end_segment - start_segment

    const region_analysis = {}
    let total = 0
    for(let i = start_segment + 1; i < end_segment; ++i) {
        for(const key in analysis_segments[i]) {
            if (region_analysis[key] === undefined) {
                region_analysis[key] = 0
            }

            region_analysis[key] += analysis_segments[i][key]
            total += 1
        }
    }

    const num_bytes_first_segment = 1000 - (start_byte%1000)
    for (let i = start_byte; i < start_byte + num_bytes_first_segment; ++i) {
        const idx = file_data[i] * 1000000 + file_data[i+1] * 1000 + file_data[i+2]
        if(region_analysis[idx] === undefined)
            region_analysis[idx] = 0
        region_analysis[idx] += 1
        total += 1
    }

    const start_last_segment = end_segment * segment_length
    for (let i = start_last_segment; i < end_byte; ++i) {
        const idx = file_data[i] * 1000000 + file_data[i+1] * 1000 + file_data[i+2]
        if(region_analysis[idx] === undefined)
            region_analysis[idx] = 0
        region_analysis[idx] += 1
        total += 1
    }

    region_analysis.length = total

    return region_analysis
}

function load_file(file) {
    const reader = new FileReader();
    reader.onload = function () {
        file_data = new Uint8Array(this.result)

        analyze()

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
    get_data,
    get_region_analysis,
    get_current_analysis,
    has_changed
}
