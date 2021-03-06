import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {RegisterFormComponent} from '../../components/auth/register'

function setup() {
  const props = {
    handleSubmit: expect.createSpy(),
    fields: {username: {}, email: {}, password:{}},
    t: expect.createSpy(),
    submitting: false
  }
  const component = TestUtils.renderIntoDocument(<RegisterFormComponent {...props} />)
  return {
    component: component,
    props: props,
    buttons: TestUtils.scryRenderedDOMComponentsWithTag(component, 'button'),
    inputs: TestUtils.scryRenderedDOMComponentsWithTag(component, 'input')
  }
}

describe('RegisterForm component', () => {
  it('should display login button', () => {
    const { buttons, component } = setup()
    expect(buttons[0]).toExist()
  })

  it('press button should call submitHandler', () => {
    const { buttons, props } = setup()
    TestUtils.Simulate.click(buttons[0])
    expect(props.handleSubmit).toHaveBeenCalled()
  })

})
