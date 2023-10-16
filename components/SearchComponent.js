import styles from "./SearchComponent.module.css";

function SearchComponent({ value, onChange, onSearch, questions = [] }) {

  const handleDropdownChange = (e) => {
    const selectedQuestion = e.target.value;
    onChange(selectedQuestion);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      <button className={styles.searchButton} type="submit" onClick={onSearch}>
        Search
      </button>
      <select
        className={styles.dropdown}
        onChange={handleDropdownChange}
        defaultValue=""
      >
        
        <option  value="" disabled>
         Select a question
        </option>
        {questions.map((question, index) => (
          <option  key={index} value={question}>
          {question}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchComponent;
