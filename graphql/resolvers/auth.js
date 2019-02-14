const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    createUser: async args => {
        try {
            const ExistingUser = await User.findOne({
                email: args.userInput.email
            })
            if (ExistingUser) {
                throw new Error('user already exists !')
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12)
            const Creator = new User({
                email: args.userInput.email,
                password: hashedPassword
            })
            const result = await Creator.save()
            return {
                ...result._doc,
                password: null
            }
        } catch (err) {
            throw err
        }
    },
    login: async ({email, password}) => {
        const user = await User.findOne({email:email})
        if(!user)
        {
            throw new Error('User does not exist !')
        }
        const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual){
            throw new Error('Password is incorrect !')
        }
        const token = await jwt.sign({userId: user.id, email: user.email}, 'some_super_secret_key',{expiresIn: '1h'})
        return {
            userId : user.id,
            token: token,
            tokenExpiration: 1
        }
    }
}