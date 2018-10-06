const React = require('react')
const data_manager = require('../data_manager')

class RegionSelector extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            start_byte: 0,
            end_byte: 0
        }

        this.updateCanvas = this.updateCanvas.bind(this)
        this.newData = this.newData.bind(this)

        data_manager.when_data_changes(this.newData)

        this.file_selectors = {
            dragging: false,
            dragging_target: 'none',
            block_last_y: 0,
            selectors: [
                {
                    byte: 0,
                    y: 0
                },
                {
                    byte: 800,
                    y: 90
                }
            ]
        }

        this.detail_selectors = {
            dragging: false,
            dragging_target: 'none',
            block_last_y: 0,
            selectors: [
                {
                    byte: 0,
                    y: 0
                },
                {
                    byte: 800,
                    y: 90
                }
            ]
        }

        this.dragging = false
        this.dragging_target = 'none'
        this.block_last_y = 0

        this.canvas_input = this.canvas_input.bind(this)
    }

    componentDidMount() {
        this.refs.file_selector.addEventListener('mousedown', this.canvas_input(this.file_selectors))
        this.refs.file_selector.addEventListener('mouseup', this.canvas_input(this.file_selectors))
        this.refs.file_selector.addEventListener('mousemove', this.canvas_input(this.file_selectors))
        this.refs.detail_selector.addEventListener('mousedown', this.canvas_input(this.detail_selectors))
        this.refs.detail_selector.addEventListener('mouseup', this.canvas_input(this.detail_selectors))
        this.refs.detail_selector.addEventListener('mousemove', this.canvas_input(this.detail_selectors))
        this.updateCanvas()
    }

    canvas_input(selector) {
        return (ev) => {
            const fst_y = selector.selectors[0].y
            const snd_y = selector.selectors[1].y

            const ev_y = ev.offsetY

            if(ev.type === 'mousedown') {
                selector.dragging = true            
                if (Math.abs(ev_y - fst_y) < 8) {
                    selector.dragging_target = 'fst_selector'
                }
                else if(Math.abs(ev_y - snd_y) < 8) {
                    selector.dragging_target = 'snd_selector'
                }
                else if(ev_y < snd_y && ev_y > fst_y) {
                    selector.dragging_target = 'selector_block'
                }
            }
            else if(ev.type === 'mouseup') {
                selector.dragging = false
                selector.block_last_y = undefined
            }
            else if(ev.type === 'mousemove') {
                if(selector.dragging) {

                    if(selector.dragging_target === 'fst_selector') {
                        selector.selectors[0].y = ev_y
                    }
                    else if(selector.dragging_target === 'snd_selector'){
                        selector.selectors[1].y = ev_y
                    }
                    else if(selector.dragging_target === 'selector_block') {
                        if(selector.block_last_y === undefined) {
                            selector.block_last_y = ev_y
                        }

                        const dy = ev_y - selector.block_last_y

                        selector.selectors[0].y += dy
                        selector.selectors[1].y += dy
                        selector.block_last_y = ev_y
                    }

                    this.updateCanvas()
                }
            }
        }
    }

    newData() {
        this.data = data_manager.get_all_data()
        this.refs.file_selector.height = window.innerHeight 
        this.refs.detail_selector.height = window.innerHeight 
        this.bytes_per_line = this.data.byteLength/this.refs.file_selector.height
        this.updateCanvas()
    }

    drawPixelData(canvas, data, selectors) {
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height

        const num_bytes = data.byteLength

        const bytes_per_pixel = num_bytes/(width*height)

        const image_data = ctx.getImageData(0, 0, width, height)
        const num_pixels = image_data.width * image_data.height
        const pixel_data = image_data.data

        let data_idx = 0
        for(let i = 0; i < num_pixels; ++i) {
            const idx = i*4
            pixel_data[idx+0] = 0
            pixel_data[idx+1] = data.getUint8(Math.floor(data_idx))
            pixel_data[idx+2] = 0
            pixel_data[idx+3] = 255
            data_idx += bytes_per_pixel
        }

        ctx.putImageData(image_data, 0, 0)

        if(selectors !== undefined) {
            ctx.fillStyle = '#ff000099'
            ctx.fillRect(0, selectors[0].y, 100, 3)
            ctx.fillStyle = '#ff000099'
            ctx.fillRect(0, selectors[1].y, 100, 3)
        }
    }

    updateCanvas() {
        if(this.data === undefined)
            return 

        const all_data = new DataView(this.data.buffer, 0, this.data.byteLength)
        this.drawPixelData(this.refs.file_selector, all_data, this.file_selectors.selectors)

        const window_start = this.file_selectors.selectors[0].y * this.bytes_per_line
        const window_end = this.file_selectors.selectors[1].y * this.bytes_per_line
        const window_size = window_end - window_start

        const filtered_data = new DataView(this.data.buffer, window_start, window_end - window_start)
        this.drawPixelData(this.refs.detail_selector, filtered_data, this.detail_selectors.selectors)

        const bytes_per_detail_line = window_size/(this.refs.detail_selector.height)
        let data_selection_start = Math.floor(this.detail_selectors.selectors[0].y * bytes_per_detail_line)
        const data_selection_end = Math.floor(this.detail_selectors.selectors[1].y * bytes_per_detail_line)
        const data_selection_size = data_selection_end - data_selection_start
        data_selection_start += window_start

        console.log(data_selection_start, data_selection_size)
    }

    render() {
        return (
            <>
                <canvas ref="file_selector" id="file_selector" width="100"></canvas>
                <canvas ref="detail_selector" id="detail_selector" width="100"></canvas>
            </>
        )
    }
}

module.exports = RegionSelector