
import { createRoot } from 'react-dom/client'
import '../src/assets/index.css'
import App from './App.jsx'
import {store} from './store';
import {Provider} from 'react-redux';
import { setupAuthInterceptor } from './utils/api';
setupAuthInterceptor(store);
createRoot(document.getElementById('root')).render( 
    <Provider store={store}>
    <App />
    </Provider>
)
