const React = require('react')
const data_manager = require('../data_manager')
const config = require('../config')

class ImageSearch extends React.Component {
    constructor(props) {
        super(props)

        this.region_width = 130
        this.renderImage = this.renderImage.bind(this)
    }

    componentDidMount() {
        requestAnimationFrame(this.renderImage)
    }

    renderImage() {
        if (this.refs.canvas === undefined) {
            return
        }

        const width = document.getElementById('vis').clientWidth
        const height = document.getElementById('vis').clientHeight
        this.refs.canvas.width = width
        this.refs.canvas.height = height

        const data = data_manager.get_data()
        if(data === undefined) {
            requestAnimationFrame(this.renderImage)
            return
        }

        const data_size = data.byteLength

        const canvas = this.refs.canvas
        const ctx = canvas.getContext('2d')
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixel_data = image_data.data

        let color_function = undefined
        let idx_function = undefined

        switch(config.structure.mode) {
            case '64_RGBA':
                color_function = (data, idx) => {
                    const color = {}
                    const byte_per_component = 2

                    color.r = data.getUint16(idx)
                    color.g = data.getUint16(idx+1*byte_per_component)
                    color.b = data.getUint16(idx+2*byte_per_component)
                    color.a = data.getUint16(idx+3*byte_per_component)

                    return color
                }
                idx_function = (idx) => {
                    return idx + 8
                }
                break;
            case '32_RGBA':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = data.getUint8(idx)
                    color.g = data.getUint8(idx+1)
                    color.b = data.getUint8(idx+2)
                    color.a = data.getUint8(idx+3)

                    return color
                }
                idx_function = (idx) => {
                    return idx + 4
                }
                break;
            case '16_RGBA':
                color_function = (data, idx) => {
                    const color = {}
                    const fst = data.getUint8(idx)
                    const snd = data.getUint8(idx+1)
                    color.r = fst >> 4
                    color.g = fst & 15
                    color.b = snd >> 4
                    color.a = fst & 15

                    return color
                }
                idx_function = (idx) => {
                    return idx + 2
                }
                break;
            case '48_RGB':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = data.getUint16(idx)
                    color.g = data.getUint16(idx+2)
                    color.b = data.getUint16(idx+4)
                    color.a = 255

                    return color
                }
                idx_function = (idx) => {
                    return idx + 6
                }
                break;
            case '24_RGB':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = data.getUint8(idx)
                    color.g = data.getUint8(idx+1)
                    color.b = data.getUint8(idx+2)
                    color.a = 255

                    return color
                }
                idx_function = (idx) => {
                    return idx + 3
                }
                break;
            case '8_R':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = data.getUint8(idx)
                    color.g = 0
                    color.b = 0
                    color.a = 255

                    return color
                }
                idx_function = (idx) => {
                    return idx + 1
                }
                break;
            case '8_G':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = 0
                    color.g = data.getUint8(idx)
                    color.b = 0
                    color.a = 255

                    return color
                }
                idx_function = (idx) => {
                    return idx + 1
                }
                break;
            case '8_B':
                color_function = (data, idx) => {
                    const color = {}
                    color.r = 0
                    color.g = 0
                    color.b = data.getUint8(idx)
                    color.a = 255

                    return color
                }
                idx_function = (idx) => {
                    return idx + 1
                }
                break;
        }

        let data_idx = 0
        for(let j = 0; j < data_size/config.structure.width; ++j) {
            for(let i = 0; i < config.structure.width; ++i) {
                const idx = i*4
                if(data_idx > (data_size - 8)) {
                    break;
                }

                const color = color_function(data, data_idx)

                pixel_data[j*width*4 + idx + 0] = color.r
                pixel_data[j*width*4 + idx + 1] = color.g
                pixel_data[j*width*4 + idx + 2] = color.b
                pixel_data[j*width*4 + idx + 3] = color.a

                data_idx = idx_function(data_idx)
            }
        }

        ctx.putImageData(image_data, canvas.width/2 - (config.structure.width/2), canvas.height/2)
        requestAnimationFrame(this.renderImage)
    }

    render() {
        return (
            <canvas ref="canvas" id="structure"></canvas>
        )
    }
}

module.exports = ImageSearch
