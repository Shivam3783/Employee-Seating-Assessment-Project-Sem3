import java.util.Scanner;

//import java.util.*;
//import java.io.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;


class MainMenu
{
    public void menu()
    {
        System.out.println("\t\t\t  EMPLOYEE SEATING ASSESMENT");
        System.out.println("\n\nPress 1 : For Employee Seating Details ");
        System.out.println("Press 2 : For Employee Work Details ");
        System.out.println("Press 3 : For Customer ");
        System.out.println("Press 4 : To Exit Portal");
    }
}


class CodeExit
{
    public void out()
    {
        System.exit(0);
    }
}


/********** Main Class ************/
class xyzz {
    public static void main(String arv[]) {
        Scanner sc = new Scanner(System.in);


        int i = 0;

        MainMenu obj1 = new MainMenu();
        obj1.menu();

        /* Initialising loop for Menu Choices */
        while (i < 4) {

            System.out.print("\nPlease Enter choice :");
             i = sc.nextInt();
          //  i = Integer.parseInt(sc.nextLine());

            switch (i) {

                case 1: {
                    try {
                        Class.forName("com.mysql.cj.jdbc.Driver");
                        Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/project", "root", "1234");
                        Statement stmt = con.createStatement();

                        System.out.print("Enter Employee's ID : ");
                        int employ_id = sc.nextInt();

                        System.out.print("Enter Employee's name : ");
                        String name = sc.next();

                        System.out.print("Enter Employee's Role : ");
                        String position = sc.next();

                        int min = 1;
                        int max = 100;
                        int random_int = (int) Math.floor(Math.random() * (max - min + 1) + min);
                        System.out.println("Your Seat No is : " + random_int);

                        stmt.executeUpdate("insert into employeeinfo value('" + employ_id + "','" + name + "','" + position + "','" + random_int + "')");

                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    }

                    // use con here
                    catch (SQLException e) {
                        //throw new RuntimeException(e);
                        e.printStackTrace();

                    }

                    System.out.print("\nPress Enter to Continue...");
                    sc.nextLine();
                    obj1.menu();
                    break;
                }

                case 2: {

                    try {
                        Class.forName("com.mysql.cj.jdbc.Driver");
                        Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/project", "root", "1234");
                        Statement stmt = con.createStatement();

                        System.out.print("Enter Employee's ID : ");
                        int employy_id = sc.nextInt();

                        System.out.print("Enter Employee's name : ");
                        String namme = sc.next();

                        System.out.println("Press 1 : If Your Work Is Done!! ");
                        System.out.println("Press 2 : If Your Work Is Not Done!! ");

                        int oneboyyeu = sc.nextInt();
                        if (oneboyyeu == 1) {
                            System.out.println("Nice! Well Done");
                            String subhead = "Complete Work";
                            stmt.executeUpdate("insert into employeeworkinfo value('" + employy_id + "','" + namme + "','" + subhead + "')");

                        }
                        if (oneboyyeu == 2) {
                            System.out.println("Make Sure You will done your Work in 2 days");
                            String two = "Incomplete Work";
                            stmt.executeUpdate("insert into employeeworkinfo value('" + employy_id + "','" + namme + "','" + two + "')");

                        }

                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    }

                    // use con here
                    catch (SQLException e) {
                        //throw new RuntimeException(e);
                        e.printStackTrace();

                    }


                    System.out.print("\nPress Enter to Continue...");
                    sc.nextLine();
                    obj1.menu();
                    break;

                }

                case 3: {

                    try {
                        Class.forName("com.mysql.cj.jdbc.Driver");
                        Connection con = DriverManager.getConnection("jdbc:mysql://localhost:3306/project", "root", "1234");
                        Statement stmt = con.createStatement();


                        System.out.println("Enter Your Name: ");
                        Scanner op = new Scanner(System.in);
                        String cus_name = op.next();

                        System.out.println("When You Came here, Employee was present in his desk? ");
                        System.out.print("If yes! then please Press (y or Y) Otherwise (n or N) : ");

                        String yo = op.next();
                        if (yo == "y") {
                            String presenty = "Present";
                            stmt.executeUpdate("insert into employeeattandancce value('" + cus_name + "','" + presenty + "')");
                        }
                        if (yo == "n") {
                            String absenti = "Absent";
                            stmt.executeUpdate("insert into employeeattandancce value('" + cus_name + "','" + absenti + "')");
                        }


                        switch (yo) {
                            case "y": {
                                System.out.println("Did Employee Solved Your Problem? ");
                                System.out.print("If yes! then please Press (y or Y) Otherwise (n or N) : ");

                                Scanner po = new Scanner(System.in);
                                String yoo = po.next();
                                if (yoo == "y") {
                                    String solved = "Solved";
                                    stmt.executeUpdate("insert into employeefeedback value('" + cus_name + "','" + solved + "')");
                                }
                                if (yoo == "n") {
                                    String unsolved = "Unsolved";
                                    stmt.executeUpdate("insert into employeefeedback value('" + cus_name + "','" + unsolved + "')");
                                }


                                switch (yoo) {
                                    case "y": {
                                        System.out.println("Please give us feedback out of 10 ");
                                        Scanner lp = new Scanner(System.in);
                                        int qwe = lp.nextInt();
                                        if (qwe > 11) {
                                            System.out.println("Wrong Choice! ");
                                        }
                                        break;
                                    }

                                    case "n": {
                                        System.out.println("Please Go to Other Employee's Desk..");
                                        break;
                                    }

                                }
                                    break ;
                            }


                        case "n": {
                            System.out.println("Sorry Sir for waste your time.. Please Go to Other Employee's Desk.. ");
                        }

                        break;

                            }

                        } catch(ClassNotFoundException e){
                            e.printStackTrace();
                        }

                        // use con here
                    catch(SQLException e){
                            //throw new RuntimeException(e);
                            e.printStackTrace();
                        }
                    System.out.print("\nPress Enter to Continue...");
                    sc.nextLine();
                    obj1.menu();

                    }

                    case 4: {
                            CodeExit obj = new CodeExit();
                            System.out.println("Thank You For Using my Software ");
                            obj.out();
                        }
                    }
            }

        }
    }

