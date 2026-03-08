// Импортируем компонент через именованный экспорт
import classes from './App.module.scss';
import TestSvg from './test.svg';

// Проверка глобальных переменных
console.log('__IS_DEV__:', __IS_DEV__);
console.log('__API__:', __API__);
console.log('__PROJECT__:', __PROJECT__);



const App = () => {
  return (
    <div className={classes.app}>
      <h1 className={classes.title}>Vite + React работает!</h1>
      {/* Теперь TestSvg - это корректный компонент */}
      <img src={TestSvg} />
      <p>
        Переменные окружения (в консоли):<br />
        __IS_DEV__: {String(__IS_DEV__)}<br />
        __API__: {__API__}<br />
        __PROJECT__: {__PROJECT__}
      </p>
    </div>
  );
};

export default App;
