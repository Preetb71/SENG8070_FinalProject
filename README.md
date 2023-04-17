# SENG8070_FinalProject
Final Project of SENG 8070 - Database Testing

1)run 'npm install' in 'integration-tests' directory and backend directory in 'persistence-service' to install all dependencies.

2) run 'docker-compose up -d --build' in both integration-tests and persistence-service to create docker containers for both.

3) I have also included the postman json file in the submission zip that will allow you to see that all the CRUD operations are working perfectly and all the relations and foreign keys are handled while performing CRUD. I was not able to complete writing all tests, so if you wish to check the CRUD operations, feel free to use the Postman Script.

4) To run the implemented integration tests, go to the 'integration-tests' container directory and run 'npm run test' in the terminal that would output the result in the results folder of the tests.
