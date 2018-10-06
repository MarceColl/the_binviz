const React = require('react')
const data_manager = require('../data_manager')

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.changedFile = this.changedFile.bind(this)
    }

    changedFile(ev) {
        data_manager.load_file(ev.target.files[0])
    }

    render() {
        return (
            <div id="menu">
                <input type="file" onChange={this.changedFile} />

                <select>
                    <option value="3d_vis">3D Visualization</option>
                    <option value="find">Find</option>
                </select>
            </div>
        )
    }
}

module.exports = Menu