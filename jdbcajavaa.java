import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;

public class jdbcajavaa {
    public static void main(String[] args) throws ClassNotFoundException {
        Class.forName("com.mysql.cj.jdbc.Driver");
        Scanner sc = new Scanner(System.in);
        try (Connection con = DriverManager
                .getConnection("jdbc:mysql://localhost:3306/CBA_21162101019", "root", "1234")) {
            try (Statement stmt = con.createStatement()) {
                String table_name = sc.next();

                String tableSql = String.format("CREATE TABLE IF NOT EXISTS %s"
                        + "(emp_id int PRIMARY KEY AUTO_INCREMENT, name varchar(30),"
                        + "position varchar(30), salary double)",table_name);
                String insert = String.format("insert into %s values(1,'dev','CEO',60000)",table_name);
                stmt.execute(tableSql);
                stmt.execute(insert);

            }
            catch(Exception s){
                System.out.println(s);
            }
            // use con here
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

        System.out.println("Hey");
    }
}
