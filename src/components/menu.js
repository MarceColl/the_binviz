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
        config.current_viz = ev.target.name
        this.forceUpdate()
        this.props.onModeChange()
    }

    configChange(ev) {
        config[config.current_viz][ev.target.id] = ev.target.value
        this.forceUpdate()
    }

    render() {
        let config_dom
        if(config.current_viz === 'structure') {
            config_dom = (
                <>
                <span>
                <label htmlFor="width">Width</label>
                <input id="width" type="range" min="10" max="1000" step="1" defaultValue={config.structure.width} onChange={this.configChange} />
                <div>{config.structure.width}</div>
                </span>
                <span>
                    <label htmlFor="mode_sel">Mode</label>
                    <div className="select" id="mode_sel">
                    <select id="mode" onChange={this.configChange} >
                        <option value="64_RGBA">64bpp RGBA</option>
                        <option value="32_RGBA">32bpp RGBA</option>
                        <option value="16_RGBA">16bpp RGBA</option>
                        <option value="48_RGB">48bpp RGB</option>
                        <option value="24_RGB">24bpp RGB</option>
                        <option value="8_R">8bpp R</option>
                        <option value="8_G">8bpp G</option>
                        <option value="8_B">8bpp B</option>
                    </select>
                    </div>
                </span>
                </>
            )
        }
        else {
            config_dom = (
                <>
                </>
            )
        }

        return (
            <>
            <pre>
            </pre>
            <div id="menu">
                <div id="menu_title">
&nbsp;____  _    __     ___      <br/>
 | __ )(_)_ _\ \   / (_)____ <br/>
 |  _ \| | '_ \ \ / /| |_  / <br/>
 | |_) | | | | \ V / | |/ /  <br/>
 |____/|_|_| |_|\_/  |_/___|
                </div>
                <div className="upload-btn-wrapper">
                    <button className="btn">Upload a file</button>
                    <input type="file" onChange={this.changedFile} />
                </div>
                <pre>
&nbsp;_____         _      <br/>
|_   _|__  ___| |___  <br/>
&nbsp;&nbsp;| |/ _ \/ _ \ (_-&lt;  <br/>
&nbsp;&nbsp;|_|\___/\___/_/__/

                </pre>
                <div className="tools">
                    <input type="image"
                        name="ngram"
                        onClick={this.selectViz}
                        src={config.current_viz === 'ngram' ? "binviz-ngram-selected.png" : "binviz-ngram-unselected.png"}
                        title="n-gram" />
                    <input type="image"
                        name="structure"
                        onClick={this.selectViz}
                        src={config.current_viz === 'structure' ? "binviz-structure-selected.png" :"binviz-structure-unselected.png"}
                        title="data structure" />
                </div>

                <fieldset id="vis_config">
                    <legend>{config.current_viz === 'ngram' ? 'n-gram' : 'Structure'} Config</legend>
                    {config_dom}
                </fieldset>
            </div>
            </>
        )
    }
}

module.exports = Menu
