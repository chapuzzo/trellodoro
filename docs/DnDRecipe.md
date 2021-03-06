# ReduxBaseApp drag and drop recipe

We have implemented drag and drop functionality using [React DnD](http://gaearon.github.io/react-dnd/) by Dan Abramov. The documentation is very descriptive and detailed so we recommend reading it. Also very enlightening the tutorial, not also teaches you about DnD, but how to think to identify and build react components. Anyway, if you want to get started right away here is the explanation of what we've done.

## Where
Create dish have two tables. One listing the whole list of ingredients and the second listing the ingredients already added to a dish. The code is on the following files
- [container](../example-app/src/smart/create-dish.js)
- [elementsAdded](../example-app/src/components/elements-added.js)
- [elementAdded](../example-app/src/components/element-added.js)
- [elementsToAdd](../example-app/src/components/elements-to_add.js)
- [elementToAdd](../example-app/src/components/elements-to-add.js)

## How

### Installation
```
npm install --save react-dnd
npm install --save react-dnd-html5-backend
```

### Concepts/Elements needed

### Container
First of all identify your container for drag and drop. Once you done it, wrap this component with a HOC provided by React DnD

```JavaScript
export default DragDropContext(HTML5Backend)(CreateDish)
```

#### Drag
In order to create a draggable item you need to define:
- A constant defining the element you want to drag. Probably on a constants file
```JavaScript
export const ItemTypes = {
  ELEMENT_ADDED: 'elementAdded',
  ELEMENT_TO_ADD: 'elementToAdd'
};
```

- The drag source contract: An object which has a property beginDrag function which returns an object with the data you want to pass to the droppable object
```JavaScript
const elementSource = {
  beginDrag(props, monitor, element) {
    return {id: props.id, amount: parseInt(element.refs.amount.value), name: props.name}
  }  
}
```
- The props to inject to your drag component: A function which returns an object with the needed properties. Most of the times you will need:
  - connectDragSource: A HOC which wraps your draggable element adding functionality to it
  - connectDragPreview: A HOC that returns what you will see being dragged.
  - isDragging: A boolean which tells you if the source is being dragged
```JavaScript
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }  
}
```
Once you define those elements you can start using those properties
```JavaScript
class Element extends Component {
  render() {
    const { name, subject, t, isDragging, connectDragPreview, connectDragSource } = this.props
    return connectDragPreview(
      <div>
        <div ref="element" style={{ opacity: isDragging ? 0.5 : 1 }}>
          {connectDragSource(<p>{name}</p>, { dropEffect: 'copy' })}
          <input type="number" placeholder={t("elementsToAdd.amountPlaceholder")} ref="amount" defaultValue="1" />
        </div>
      </div>,
    { anchorX: 1 })
  }
}
```
Last you have to wrap your component with the DragSource HOC
```JavaScript
export default DragSource(ItemTypes.ELEMENT_TO_ADD, elementSource, collect)(Element)
```

#### Drop

The drop implementation is very similar: Define:

- The drop target contract: An object which has a function drop which will be called once an item has been dropped on the right place. If you are using redux probably you'll want to call and action creator passed as prop.
```JavaScript
const elementTarget = {
  drop(props, monitor, element) {
    const { id } = monitor.getItem()
    element.props.remove(id)
  }
}
```
- The props to inject to your drop component: A function which returns an object with the needed properties. Most of the times you need
  - connectDropTarget: A HOC which wraps your droppable element adding functionality to it
  - isOver: A boolean which tells you if the source is over your droppable element 
```JavaScript
function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}
```
Once you define those elements you can start using those properties
```JavaScript
class ElementsToAdd extends Component {
  render() {
    const { subject, elements, add, t, isOver, connectDropTarget } = this.props
    const hasElements = elements.length > 0
    const list = !hasElements ?
      <em>{t('elementsToAdd.empty', {item: t('elementsToAdd.' + subject, {count: 0})})}</em> :
      elements.map(e =>
        <Element
          id={e.id}
          add= {add}
          name={e.name}
          subject={subject}
          t={t}
          key={e.id}/>
    )

    return connectDropTarget(
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <h3> {t('elementsToAdd.total', {item: capitalize(t('elementsToAdd.' + subject, {count: 0}))})} </h3>
        <div>{list}</div>
        {isOver &&
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'yellow',
          }} />
        }
      </div>
    )
  }
}
```
Last you have to wrap your component with the DragSource HOC

```JavaScript
export default DropTarget(ItemTypes.ELEMENT_ADDED, elementTarget, collect)(ElementsToAdd)
```


### FAQ
- **How to change the element being wrapped?**
You have the connectDragPreview method for this purpose. You can pass the element you want to drag. This method accepts some extra parameters. See the [documentation about it](https://gaearon.github.io/react-dnd/docs-drag-source-connector.html).
First of all, you should know that the element being wrap is a snapshoot taken by the browser before start dragging.
 - If you want change that image you can pass an image to connectDragPreview on your render method or better on your componentDidMount
 - If you want the element being wrap to be different from the draggable area, use connectDragPreview to wrap a different group of elements on your render method.
 - If you want to apply some styling to the image taken by the browser you cannot. What you should do is create a component similar to the one  you want to drag, apply to it the styles you want and then, pass it to connectDragPreview. [Here you have an example](https://github.com/gaearon/react-dnd/tree/master/examples/02%20Drag%20Around/Custom%20Drag%20Layer).

- **How do I combine several drag sources and drop targets in a single component? Or even several HOCs?**
If you see the examples, it is done manually wrapping one component into another. But if you prefer a cleaner way you can use _.flow from lodash or similar method to wrap them up
