import { defineConfig } from 'vite'
const path = require('path')

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/datepicker/datepicker.ts'),
            name: 'DatePicker',
            fileName: (format) => `datepicker.${format}.js`,
            formats: ['es', 'umd'],
        },
    }
})