class chemical_app {
    value_mapping = {
        1: 'density',
        2: 'viscosity',
        3: 'packSize',
        4: 'quantity',
    }

    status = 0

    constructor(data, table_dom) {
        this.data = data;
        this.table_dom = table_dom;
        this.selected = new Set()
    }

    _row(item) {
        const row = document.createElement('tr');

        const check_button_cell = document.createElement('th')
        const index_cell = document.createElement('td');
        const name_cell = document.createElement('td');
        const vendor_cell = document.createElement('td');
        const density_cell = document.createElement('td');
        const viscosity_cell = document.createElement('td');
        const packaging_cell = document.createElement('td');
        const pack_size_cell = document.createElement('td');
        const unit_cell = document.createElement('td');
        const quantity_cell = document.createElement('td');

        const check_img = document.createElement('img');
        check_img.src = './images/check_solid.png';
        check_img.width = 20
        check_img.height = 20
        this.check_button_select_event(check_img)
        check_button_cell.appendChild(check_img);

        index_cell.textContent = item.id;
        index_cell.classList.add('px-2');

        name_cell.textContent = item.chemicalName;

        vendor_cell.textContent = item.vendor;

        const density_input = document.createElement('input')
        density_input.value = item.density
        density_input.classList.add('form-control', 'border', 'border-secondary', 'rounded-0', 'p-2')
        density_input.setAttribute('value_type', 1)
        this.onchange_input_event(density_input);
        density_cell.appendChild(density_input);

        const viscosity_input = document.createElement('input')
        viscosity_input.value = item.viscosity
        viscosity_input.setAttribute('value_type', 2)
        viscosity_input.classList.add('form-control', 'border', 'border-secondary', 'rounded-0', 'p-2')
        this.onchange_input_event(viscosity_input);
        viscosity_cell.appendChild(viscosity_input)

        packaging_cell.textContent = item.packaging;

        const pack_size_input = document.createElement('input')
        pack_size_input.value = item.packSize
        pack_size_input.classList.add('form-control', 'border', 'border-secondary', 'rounded-0', 'p-2')
        pack_size_input.setAttribute('value_type', 3)
        this.onchange_input_event(pack_size_input);
        pack_size_cell.appendChild(pack_size_input)

        unit_cell.textContent = item.unit;

        const quantity_input = document.createElement('input')
        quantity_input.value = item.quantity
        quantity_input.classList.add('form-control', 'border', 'border-secondary', 'rounded-0', 'p-2')
        quantity_input.setAttribute('value_type', 4)
        this.onchange_input_event(quantity_input);
        quantity_cell.appendChild(quantity_input);

        row.append(check_button_cell)
        row.appendChild(index_cell);
        row.appendChild(name_cell);
        row.appendChild(vendor_cell);
        row.appendChild(density_cell);
        row.appendChild(viscosity_cell);
        row.appendChild(packaging_cell);
        row.appendChild(pack_size_cell);
        row.appendChild(unit_cell);
        row.appendChild(quantity_cell);
        row.setAttribute('index', item.id)
        return row;
    }

    load_table(data = this.data, table_dom = this.table_dom) {
        let i=1
        data.forEach(item => {
            item.id = i;
            i++;
            let row = this._row(item);
            table_dom.appendChild(row);
        });
    }

    onchange_input_event(element) {
        element.addEventListener('input', () => {
            element.classList.add('input-changed');
        })
    }

    check_button_select_event(element) {
        element.addEventListener('click', (ev) => {
            const row = ev.target.parentElement.parentElement;
            if (!parseInt(row.getAttribute('selected'))) {
                row.setAttribute('selected', 1);
                row.classList.add('hover')
                this.selected.add(row);
            } else {
                row.setAttribute('selected', 0);
                row.classList.remove('hover');
                this.selected.delete(row);
            }
        })
    }

    move(direction = 1) {
        if (this.selected.size < 1) {
            alert("Warning: Atleast one row must be selected");
        } else if (this.selected.size > 1) {
            alert('Warning: You can only move one row at a time');
        } else {
            direction == 1 ? this.move_up() : this.move_down();
        }
    }

    move_up() {
        this.selected.forEach(row => {
            const index = parseInt(row.getAttribute('index'));
            if (index > 1) {
                const previous_row = row.previousElementSibling;
                this.table_dom.removeChild(row);
                this.table_dom.insertBefore(row, previous_row);
                row.cells[1].innerHTML = index - 1;
                previous_row.cells[1].innerHTML = index;

                const cur_row_index = index - 1;
                const cur_row_id = index;
                const prev_row_index = index - 2;
                const prev_row_id = index - 1;

                row.setAttribute('index', prev_row_index+1);
                previous_row.setAttribute('index', index);

                this.data[cur_row_index]['id'] = prev_row_id;
                this.data[prev_row_index]['id'] = cur_row_id;
                let temp = this.data[cur_row_index];
                this.data[cur_row_index] = this.data[prev_row_index];
                this.data[prev_row_index] = temp;
            }
        })
    }

    move_down() {
        const row = this.selected.values().next().value;
        const index = parseInt(row.getAttribute('index'));
        if (index <= this.data.length - 1) {
            this.selected.clear();
            this.selected.add(row.nextElementSibling);
            this.move_up();
            this.selected.clear();
            this.selected.add(row);
        }
    }

    save(table_dom = this.table_dom) {
        const changed_input_elements = table_dom.querySelectorAll('.input-changed');
        let changed_values = {}
        changed_input_elements.forEach(element => {
            const row = element.parentElement.parentElement
            const index = row.getAttribute('index');
            const key = this.value_mapping[element.getAttribute('value_type')];
            const value = element.value;
            if (index in changed_values) {
                changed_values[index][key] = value;
            } else {
                changed_values[index] = {};
                changed_values[index][key] = value;
            }
        })
        for (const index in changed_values) {
            for (const field in changed_values[index]) {
                this.data[index - 1][field] = changed_values[index][field];
            }
        }
    }

    refresh() {
        this.selected.clear();
        this.load_table();
        this.status = 0;
    }

    delete() {
        if(this.status == 1)return;
        this.selected.forEach(row => {
            const index = row.getAttribute('index');
            this.table_dom.removeChild(row);
            this.data.splice(index - 1, 1);

            for (let i = index - 1; i < this.data.length; i++) {
                this.data[i]['id'] = i + 1
            }
        })
        this.table_dom.innerHTML = "";
        this.load_table()
        this.selected.clear()
    }

    add_form() {
        if (this.status) return;
        this.status = 1
        const map = {
            2: ['chemicalName', 1],
            3: ['vendor', 1],
            4: ['density', 0],
            5: ['viscosity', 0],
            6: ['packaging', 1],
            7: ['packSize', 0],
            8: ['unit', 1],
            9: ['quantity', 0],
        }

        const row = document.createElement('tr');
        row.setAttribute('id', 'add_row_form');
        const add_btn_cell = document.createElement('th');
        const check_img = document.createElement('img');
        check_img.src = './images/add_circle.png';
        check_img.width = 20
        check_img.height = 20

        check_img.addEventListener('click', (ev) => {
            this.add(ev.target.parentElement.parentElement, map);
        })

        add_btn_cell.appendChild(check_img);
        row.appendChild(add_btn_cell);

        const index_cell = document.createElement('td');
        index_cell.textContent = this.data.length + 1;
        row.appendChild(index_cell);

        for (let i = 2; i < 10; i++) {
            let cell = document.createElement('td');
            let input = document.createElement('input');
            input.classList.add('form-control', 'border', 'border-secondary', 'rounded-0', 'p-2');
            if (map[i][1] == 1) {
                input.setAttribute('type', 'text');
            } else {
                input.setAttribute('type', 'number')
            }
            cell.appendChild(input);
            row.appendChild(cell);
        }

        this.table_dom.appendChild(row);
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }

    add(row, map) {
        let item = {}
        for (let i = 2; i < row.cells.length; i++) {
            let value = row.cells[i].firstChild.value
            if (value == "") {
                alert('User Error : Some cells are either empty or wrongly filled');
                return;
            }
            item[map[i][0]] = value;
        }
        item['id'] = this.data.length + 1;
        this.data.push(item);
        this.table_dom.appendChild(this._row(item));
        this.table_dom.removeChild(row);
        this.status = 0;
    }

    sort_by_key(array, key) {
        return array.sort((a, b) => {
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            }
            return 0;
        });
    }

    sort_rows(key){
        const sorted_array = this.sort_by_key(this.data, key);
        this.status = 0
        this.selected.clear()
        this.table_dom.innerHTML = "";
        this.load_table(sorted_array);
        this.status = 1
    }
}



window.onload = () => {
    let table_dom = document.getElementById('chemical_table_body');
    const chemical_data = [{
        'id': 1,
        'chemicalName': 'Ethanol',
        'vendor': 'ExxonMobil',
        'density': 7693.96,
        'viscosity': 41.33,
        'packaging': 'Barrel',
        'packSize': 174.76,
        'unit': 't',
        'quantity': 7485.95
    },
    {
        'id': 2,
        'chemicalName': 'Ferric Nitrate',
        'vendor': 'Formosa',
        'density': 2189.52,
        'viscosity': 45.25,
        'packaging': 'Bag',
        'packSize': 176.94,
        'unit': 'L',
        'quantity': 4005.99
    },
    {
        'id': 3,
        'chemicalName': 'Sulfuric Acid',
        'vendor': 'LG Chem',
        'density': 6660.3,
        'viscosity': 59.44,
        'packaging': 'Barrel',
        'packSize': 124.69,
        'unit': 'kg',
        'quantity': 3389.01
    },
    {
        'id': 4,
        'chemicalName': 'Xylene',
        'vendor': 'DowDuPont',
        'density': 7639.54,
        'viscosity': 62.18,
        'packaging': 'Barrel',
        'packSize': 115.08,
        'unit': 't',
        'quantity': 5613.74
    },
    {
        'id': 5,
        'chemicalName': 'Glycol Ether PM',
        'vendor': 'ExxonMobil',
        'density': 1882.82,
        'viscosity': 39.58,
        'packaging': 'N/A',
        'packSize': 225.96,
        'unit': 't',
        'quantity': 3586.12
    },
    {
        'id': 6,
        'chemicalName': 'Sulfuric Acid',
        'vendor': 'ExxonMobil',
        'density': 4321.92,
        'viscosity': 51.14,
        'packaging': 'Barrel',
        'packSize': 258.37,
        'unit': 't',
        'quantity': 6213.37
    },
    {
        'id': 7,
        'chemicalName': 'n-Pentane',
        'vendor': 'Sinopec',
        'density': 1779.0,
        'viscosity': 21.42,
        'packaging': 'N/A',
        'packSize': 170.2,
        'unit': 't',
        'quantity': 7031.85
    },
    {
        'id': 8,
        'chemicalName': 'Ammonium Persulfate',
        'vendor': 'Sinopec',
        'density': 2556.27,
        'viscosity': 57.39,
        'packaging': 'Bag',
        'packSize': 182.47,
        'unit': 'kg',
        'quantity': 7729.5
    },
    {
        'id': 9,
        'chemicalName': 'Sodium Hydroxide',
        'vendor': 'ExxonMobil',
        'density': 4193.05,
        'viscosity': 38.6,
        'packaging': 'N/A',
        'packSize': 228.91,
        'unit': 't',
        'quantity': 2982.15
    },
    {
        'id': 10,
        'chemicalName': 'Acetone',
        'vendor': 'LG Chem',
        'density': 6235.48,
        'viscosity': 55.36,
        'packaging': 'Bag',
        'packSize': 260.58,
        'unit': 'L',
        'quantity': 5475.96
    },
    {
        'id': 11,
        'chemicalName': 'Benzene',
        'vendor': 'LG Chem',
        'density': 5632.37,
        'viscosity': 19.2,
        'packaging': 'Bag',
        'packSize': 141.35,
        'unit': 'kg',
        'quantity': 7874.14
    },
    {
        'id': 12,
        'chemicalName': 'Sodium Hydroxide',
        'vendor': 'BASF',
        'density': 5538.81,
        'viscosity': 50.45,
        'packaging': 'N/A',
        'packSize': 281.87,
        'unit': 'kg',
        'quantity': 6366.26
    },
    {
        'id': 13,
        'chemicalName': 'Dimethylaminopropylamino',
        'vendor': 'BASF',
        'density': 6888.35,
        'viscosity': 75.2,
        'packaging': 'Barrel',
        'packSize': 294.19,
        'unit': 'kg',
        'quantity': 1612.22
    },
    {
        'id': 14,
        'chemicalName': 'Benzene',
        'vendor': 'ExxonMobil',
        'density': 3518.89,
        'viscosity': 27.29,
        'packaging': 'Bag',
        'packSize': 183.79,
        'unit': 'kg',
        'quantity': 6878.86
    },
    {
        'id': 15,
        'chemicalName': 'Xylene',
        'vendor': 'Sinopec',
        'density': 1821.83,
        'viscosity': 18.29,
        'packaging': 'Bag',
        'packSize': 182.5,
        'unit': 'L',
        'quantity': 3086.56
    }]
    const app = new chemical_app(chemical_data, table_dom);
    app.load_table();
    document.querySelector('#table_save').addEventListener('click', () => {
        app.save();
    })
    document.querySelector('#table_refresh').addEventListener('click', () => {
        table_dom.innerHTML = "";
        app.refresh();
    })
    document.querySelector('#row_move_up').addEventListener('click', () => {
        app.move(1);
    })
    document.querySelector('#row_move_down').addEventListener('click', () => {
        app.move(0);
    })
    document.querySelector('#row_delete').addEventListener('click', () => {
        app.delete();
    })
    document.querySelector('#add_row').addEventListener('click', () => {
        app.add_form()
    })
    document.querySelector('#chemical_name').addEventListener('click', ()=>{
        app.sort_rows('chemicalName')
    })
    document.querySelector('#index').addEventListener('click', ()=>{
        app.sort_rows('id')
    })
    document.querySelector('#vendor').addEventListener('click', ()=>{
        app.sort_rows('vendor')
    })
    document.querySelector('#density').addEventListener('click', ()=>{
        app.sort_rows('density')
    })
    document.querySelector('#viscosity').addEventListener('click', ()=>{
        app.sort_rows('viscosity')
    })
    document.querySelector('#packaging').addEventListener('click', ()=>{
        app.sort_rows('packaging')
    })
    document.querySelector('#packsize').addEventListener('click', ()=>{
        app.sort_rows('packSize')
    })
    document.querySelector('#unit').addEventListener('click', ()=>{
        app.sort_rows('unit')
    })
    document.querySelector('#quantity').addEventListener('click', ()=>{
        app.sort_rows('quantity')
    })
}


