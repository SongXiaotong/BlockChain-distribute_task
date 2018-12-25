// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import metaCoinArtifact from '../../build/contracts/MetaCoin.json'
const MetaCoin = contract(metaCoinArtifact)
let accounts
let account
let pos
let meta
let tasknum
let total
let users = ['first', 'second', 'third', 'forth']
const App = {
  start: function () {
    const self = this
    total = 0
    pos = 0
    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider)
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]
      self.refreshBalance()
      self.refreshTaskList()
      self.refresh()
    })
  },

  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },

  distributeTask: function () {
    const self = this
// upload the table
    const amount = parseInt(document.getElementById('amount').value)
    const name = document.getElementById('receiver').value
    const task = document.getElementById('task').value
    self.setStatus('Initiating transaction... (please wait)')
// transmit the coin
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.disTask(name, amount, { from: account })
    }).then(function (value) {
      if(!!value){
        console.log("value" + value)
        self.addTask(name, task, amount, 1)
        self.addtable(amount, name, task)
        self.setStatus('Distribute complete!')
        self.refreshBalance()
        self.refresh()
      }
      else
      self.setStatus('Distribute failed!')

    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error distributing; see log.')
    })
// refresh the total task
    
  },

  deleteTask: function () {
    const self = this
// upload the table
    const amount = parseInt(document.getElementById('amount').value)
    const name = document.getElementById('receiver').value
    const task = document.getElementById('task').value
    self.setStatus('Initiating ... (please wait)')
// transmit the coin
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.deleteTask(name, amount, { from: account })
    }).then(function (value) {
      if(!!value){
        self.setStatus('Delete complete!')
        self.addtable(-amount, name, task)
        self.refreshBalance()
        self.refresh()
        self.addTask(name, task, amount, 0)
      }
      else
      self.setStatus('Delete failed!')

    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error deleting; see log.')
    })
  },

  setName: function() {
    const self = this
    const setaddress = parseInt(document.getElementById('setaddress').value)
    const name = document.getElementById('set_name').value
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      // console.log("1"+accounts[1])
      return meta.setName(accounts[setaddress], name, { from: account })
    }).catch(function (e) {
      console.log(e)
    })
    self.refresh()
  },

  refresh: function () {
    const self = this
    // refresh the individual work point
    for(let i = 0; i < 4; ++i){
      MetaCoin.deployed().then(function (instance) {
        meta = instance
        return meta.getBalance.call(accounts[i+1], { from: account })
      }).then(function (value) {
        const first = document.getElementById(users[i])
        first.innerHTML = value.valueOf()
      }).catch(function (e) {
        console.log(e)
      })

      MetaCoin.deployed().then(function (instance) {
        meta = instance
        return meta.getName.call(accounts[i+1], { from: account })
      }).then(function (value) {
        const firstname = document.getElementById(users[i]+"name")
        if(value != "")
          firstname.innerHTML = value.valueOf()
        else
          firstname.innerHTML = "undefined"
      }).catch(function (e) {
        console.log(e)
      })
    }
  
  },

  refreshBalance: function () {
    const self = this
    // refresh the left points
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getBalance.call(account, { from: account })
    }).then(function (value) {
      const balanceElement = document.getElementById('balance')
      balanceElement.innerHTML = value.valueOf()
    }).catch(function (e) {
      console.log(e)
      self.setStatus('Error getting balance; see log.')
    })

  },

  refreshTaskList: function () {
    const self = this
    tasknum = 0;
    console.log(1234)
    MetaCoin.deployed().then(function (instance) {
      meta = instance
      return meta.getTaskNum.call({ from: account })
    }).then(function (value) {
      tasknum = value
      for(let i = 0; i < tasknum; ++i){
        MetaCoin.deployed().then(function (instance) {
          meta = instance
          return meta.getTaskBySeq.call(i, { from: account})
        }).then(function(value){
          console.log("value = " + value)
          const taskcontent = value
          const taskinfo = taskcontent.split("/")
          console.log("info = " + taskinfo[0])
          self.addtable(taskinfo[2], taskinfo[0], taskinfo[1])
        })
      }
    })
    
  },

  addtable: function(amount, receiver, task){
      const oTbodyFirst = document.getElementsByTagName('tbody')[0];
      const oTr = document.createElement('tr')
      oTbodyFirst.appendChild(oTr)
      const oTdseq = document.createElement('td') 
      oTdseq.innerHTML = ++pos
      const oTdmem = document.createElement('td') 
      oTdmem.innerHTML = receiver
      const oTdtas = document.createElement('td')
      oTdtas.innerHTML = task
      const oTdpoint = document.createElement('td')
      oTdpoint.innerHTML = amount
      oTr.appendChild(oTdseq)
      oTr.appendChild(oTdmem)
      oTr.appendChild(oTdtas)
      oTr.appendChild(oTdpoint)
      const totaltask = document.getElementById('total_point')
      total = parseInt(total) + parseInt(amount)
      totaltask.innerHTML = total
      console.log(total) 
  },

  addTask: function(name, task, point, status){
    let taskcontent
    if(status)
      taskcontent = name.toString() + "/"+task.toString()+ "/" + point.toString()
    else
      taskcontent = name.toString() + "/"+task.toString()+ "/-" + point.toString()
    console.log("taskcontent" + taskcontent.toString())
    MetaCoin.deployed().then(function (instance){
      meta = instance
      return meta.addTask(taskcontent, {from: account})
    }).catch(function (e) {
      console.log(e)
    })
  }

}



window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn(
      'Using web3 detected from external source.' +
      ' If you find that your accounts don\'t appear or you have 0 MetaCoin,' +
      ' ensure you\'ve configured that source properly.' +
      ' If using MetaMask, see the following link.' +
      ' Feel free to delete this warning. :)' +
      ' http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn(
      'No web3 detected. Falling back to http://127.0.0.1:8545.' +
      ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
      ' Consider switching to Metamask for development.' +
      ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
    )
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  }

  App.start()
})
