use firefly_signal::db::setup_pool_from_path;
use sqlx::prelude::*;

#[tokio::test]
async fn test_sqlite() {
    let path = "/tmp/test.db";
    let pool = setup_pool_from_path(path, 1).await.unwrap();
    let mut conn = pool.acquire().await.unwrap();

    conn.execute("CREATE TABLE test (id INTEGER PRIMARY KEY)")
        .await
        .unwrap();
    conn.execute("INSERT INTO test (id) VALUES (1)")
        .await
        .unwrap();
    let rows = sqlx::query("SELECT id FROM test")
        .fetch_all(&mut *conn)
        .await
        .unwrap();
    let row = rows.get(0).unwrap();
    assert_eq!(row.get::<i32, _>(0), 1);
}
