const { expect } = require('chai')
const { ethers } = require('hardhat')
const { ZERO_ADDRESS } = require('../constants')

describe('Dash', function () {
  let wallet
  let wallet2
  let dash

  this.beforeAll(async () => {
    const [owner, addr1] = await ethers.getSigners()

    wallet = owner
    wallet2 = addr1

    const Dash = await ethers.getContractFactory('Dash')
    dash = await Dash.deploy()

    await dash.deployed()
  })

  it('should', async () => {
    expect(0).to.eq(0)
  })
})
