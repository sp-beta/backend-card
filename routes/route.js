import {Router} from "express";
const router = Router();
import * as controller from "../controllers/appController.js";
import Auth,{localVariables} from "../middlewares/auth.js"

/** POST Methods */
router.route('/register').post(controller.register); // register user
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end()); // authenticate user
router.route('/login').post(controller.verifyUser,controller.login);//login user

router.route('/user/:email').get(controller.getUser); // user with email
router.route('/generateOTP').get(controller.verifyUser,localVariables,controller.generateOTP); //genrate otp
router.route("/signupgenerateOTP").get(localVariables, controller.generateOTP);
router.route('/verifyOTP').get(controller.verifyOTP); //verify otp
router.route('/verifyOTPSignup').get(controller.verifyOTPSignup); //verify otp for signup page
router.route('/createResetSession').get(controller.createResetSession) // reset all the variables
router.route('/userdata').get(Auth, controller.getuserData);

router.route('/updateuser').put(Auth,controller.updateUser); // is use to update the user profile
router.route('/resetPassword').put(controller.verifyUser,controller.resetPassword); //to reset password

router.route("/personal-form").post(Auth,controller.submitPersonalForm); //
router.route("/personal-form").get(Auth,controller.getPersonalForm); // get the personal form

router.route("/business-form").post(Auth,controller.submitBusinessForm); //
router.route("/business-form").get(Auth,controller.getBusinessForm); // get the business form




export default router;