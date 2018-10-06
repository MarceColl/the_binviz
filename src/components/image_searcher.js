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
        this.refs.canvas.height = window.innerHeight
        this.refs.canvas.width = 900

        requestAnimationFrame(this.renderImage)
    }

    renderImage() {
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

        let data_idx = config.image_searcher.offset
        for(let j = 0; j < data_size/config.image_searcher.width; ++j) {
            for(let i = 0; i < config.image_searcher.width; ++i) {
                const idx = i*4
                if(data_idx > (data_size - 4)) {
                    break;
                }

                pixel_data[j*900*4 + idx + 0] = data.getUint8(data_idx)
                pixel_data[j*900*4 + idx + 1] = data.getUint8(data_idx+1)
                pixel_data[j*900*4 + idx + 2] = data.getUint8(data_idx+2)
                pixel_data[j*900*4 + idx + 3] = 255
                data_idx += 3 
            }
        }

        ctx.putImageData(image_data, canvas.width/2 - (config.image_searcher.width/2), canvas.height/2)
        requestAnimationFrame(this.renderImage)
    }

    render() {
        return (
            <canvas ref="canvas" id="image_search"></canvas>
        )
    }
}

module.exports = ImageSearch