import Image from "next/image";
import Link from "next/link";

import styles from "./page.module.css";
import SearchComponent from "../components/SearchComponent.js";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.card}>
          <Link href="/qandachatgptuser">
            <p className={styles.cardLink}>Q & A mit GPT und Knowledge Base</p>
          </Link>
        </div>
        <div className={styles.card}>
          <Link href="/myknowledgebase">
            <p className={styles.cardLink}>SQuAD Testbase</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
