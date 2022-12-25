# Canvas CSS Class

This plugin do two things : 
- Add the class `.canvas-file` to the body of each canvas file, and adding the attribute `[data-path="filepath"]` 
- Allow you to add custom css class to canvas, using a modal input. Obviously, you can also remove the css-class using the plugin, with the settings or the commands modal. 


---
Yeah, that's it.


# Usage

The plugin will add two commands to the command modal :
- `Add CSS class` : Add a css class to the current canvas file
- `Remove CSS class` : Remove a css class to the current canvas file

You can also use the settings to add or remove a css class to the current canvas file.

Moreover, the settings allow you to add a css class for a not-opened canvas file, using the filepath of the file. It allows you to add a css class to a canvas file, even if you don't have it opened.

![](docs/add_css_class_settings.png)


> **Warning**   
> If the filepath is edited (aka the file is moved or renamed), the css class will not be applied anymore. You will have to edit the filepath in the settings.

In the settings, you can also : 
- Remove all the css class 
- Remove specific css class
- Edit a css class (renaming it)

![](docs/canvas-settings.png)


> **Note**  
> - You don't need to add the `.canvas` to the filepath. The plugin will do it for you
> - Same for class, the `.` will be added automatically when the CSS class is added.
> - And, in the same idea, space will be converted to `-` in the class name, and converted to lowercase.

# Installation

- Install the plugin using the community plugin manager (not yet available)
- Using [BRAT](https://github.com/TfTHacker/obsidian42-brat) using this link : `https://github.com/Lisandra-dev/obsidian-canvas-css-class`

---
# :robot: Developing

You can help me to develop the plugin using npm !

- First clone the project on your computer with git clone `git@github.com:Lisandra-dev/canvas-css-class.git`
- cd `canvas-css-class`
- `npm install`


Some notes:

- I use Conventional Commit to generate the commit message, so please respect the format!
- Don't forget to documents your function!

---

If you find this plugin you can give me some coffee money : <br/>
<a href='https://ko-fi.com/X8X54ZYAV' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
