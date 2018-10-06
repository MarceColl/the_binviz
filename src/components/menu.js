const React = require('react')
const data_manager = require('../data_manager')
const config = require('../config')

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.changedFile = this.changedFile.bind(this)
        this.selectViz = this.selectViz.bind(this)
        this.configChange = this.configChange.bind(this)
    }

    changedFile(ev) {
        data_manager.load_file(ev.target.files[0])
    }

    selectViz(ev) {
        config.current_viz = ev.target.value
        this.forceUpdate()
        
    }

    configChange(ev) {
        config[config.current_viz][ev.target.id] = ev.target.value
        this.forceUpdate()
    }

    render() {
        let config_dom 
        if(config.current_viz === 'image_searcher') {
            config_dom = (
                <>
                <span>
                <label htmlFor="width">Width</label>
                <input id="width" type="range" min="10" max="1000" step="1" onChange={this.configChange} />
                <input type="text" value={config.image_searcher.width} readonly />
                </span>
                </>
            )
        }

        return (
            <div id="menu">
                <input type="file" onChange={this.changedFile} />

                <select onChange={this.selectViz} >
                    <option value="3d_vis">3D Visualization</option>
                    <option value="image_searcher">Find</option>
                </select>

                {config_dom}
            </div>
        )
    }
}

module.exports = Menu